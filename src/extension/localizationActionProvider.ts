import * as vscode from 'vscode';
import { KeyValuePair } from './keyValuePair';
import { LocalizationCommand } from './localizationCommand';
import { ReplaceParameters } from './replaceParameters';
import { camelize } from './camelize';
import { empty } from './empty';
import { getStringWithoutEscapes } from './parser/parser';

export class LocalizationActionProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix
  ];

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.ProviderResult<vscode.CodeAction[]> {
    const text = getStringWithoutEscapes(document.getText(range));
    if (text === empty) {
      return;
    }

    return [this.createRefactorExtractToL10nFiles(document.uri, range, text)];
  }

  private createRefactorExtractToL10nFiles(
    uri: vscode.Uri,
    range: vscode.Range,
    value: string
  ): vscode.CodeAction {
    const codeAction = new vscode.CodeAction(
      `Extract value to arb files`,
      vscode.CodeActionKind.RefactorExtract
    );
    codeAction.command = new LocalizationCommand([
      new ReplaceParameters(
        uri,
        range,
        new KeyValuePair(camelize(value), value)
      )
    ]);
    return codeAction;
  }
}
