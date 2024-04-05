import * as path from 'path';
import * as vscode from 'vscode';
import { CommandParameters } from '../commands/commandParameters';
import { Configuration } from '../shared/configuration';
import { EditFilesCommand } from '../commands/editFilesCommand';
import { EditFilesParameters } from '../commands/editFilesParameters';
import { InputBoxCommand } from '../commands/inputBoxCommand';
import { LocalizationActionProvider } from '../codeActions/localizationActionProvider';
import { applySaveAndRunGeneration } from './applySaveAndRunFlutterPubGet';
import { setEditFilesParameters } from './setEditFilesParameters';
import { sortAndFormat } from './sortAndFormat';
import { sortAndSave } from './sortAndSave';

export function activate(context: vscode.ExtensionContext): void {
  vscode.workspace.onDidChangeConfiguration((event) => {
    const affected = event.affectsConfiguration('l10nization');
    if (affected) {
      // reload configuration on changes to l10nization settings
      Configuration.getInstance().reload();
    }
  });
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider('dart', new LocalizationActionProvider(), {
      providedCodeActionKinds: LocalizationActionProvider.providedCodeActionKinds,
    }),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(InputBoxCommand.commandName, async (...args: CommandParameters[]): Promise<void> => {
      const editFilesParameters = await setEditFilesParameters(args[0]);
      await vscode.commands.executeCommand(EditFilesCommand.commandName, editFilesParameters);
    }),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(EditFilesCommand.commandName, async (...args: EditFilesParameters[]): Promise<void> => applySaveAndRunGeneration(args[0])),
  );
  context.subscriptions.push(vscode.commands.registerCommand('l10nization.sortArbFiles', async (): Promise<void> => sortAndSave()));

  context.subscriptions.push(
    vscode.workspace.onWillSaveTextDocument((e) => {
      const organize = Configuration.getInstance().getOrganizeOnSave();

      if (organize) {
        const editor = vscode.window.activeTextEditor;

        if (editor && editor.document === e.document && path.extname(e.document.fileName) === '.arb') {
          e.waitUntil(sortAndFormat(e.document, editor));
        }
      }
    }),
  );
}

export function deactivate(): void {}
