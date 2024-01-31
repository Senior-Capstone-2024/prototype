/**
 * @fileoverview Generate webview panels related to our extension
 * @author Mihai Siia <mihai.siia.dev@gmail.com>
 * 1/25/2024
 */
import * as vscode from "vscode";
import { getUri } from "../utils/getUris";
import { getNonce } from "../utils/getUris";

export class GradeFastHomePanel {
    public static currentPanel: GradeFastHomePanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);

        this._setWebviewMessageListener(this._panel.webview);
    }

    public static render(extensionUri: vscode.Uri) {
        if (GradeFastHomePanel.currentPanel) {
            GradeFastHomePanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
        } else {
            const panel = vscode.window.createWebviewPanel("gradefast", "GradeFast", vscode.ViewColumn.One, {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath (extensionUri, 'out')]
            });
            
            GradeFastHomePanel.currentPanel = new GradeFastHomePanel(panel, extensionUri);
        }
    }

    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
        const webviewUri = getUri(webview, extensionUri, ["out", "webview.js"]);

        const nonce = getNonce();

        return /*html*/ `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}';">
                    <title>GradeFast</title>
                </head>
                <body>
                    <h1>GradeFast</h1>
                    <vscode-button id="test">Select Folder Containing Assignments</vscode-button>
                    <section class="component-example">
                    <p>File1</p>
                    <vscode-divider role="presentation"></vscode-divider>
                    <p>File2</p>
                    <vscode-divider role="presentation"></vscode-divider>
                    <p>File3</p>
                    <vscode-divider role="presentation"></vscode-divider>
                    <p>File4</p>
                    <vscode-divider role="presentation"></vscode-divider>
                    <p>File5</p>
                    <vscode-divider role="presentation"></vscode-divider>
                    <p>File6</p>
                    <vscode-divider role="presentation"></vscode-divider>
                    </section>
                    <href src="${webview.asWebviewUri(vscode.Uri.file('/Users/mihaisiia/GradeFast/learning'))}">
                    <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
                </body>
            </html>
            `;
            // <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; font-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
        }

    /**
     * Create a webview message listener that executes code upon receiving a message from webview context.
     * @param webview webview being shown by VS Code.
     */
    private _setWebviewMessageListener(webview: vscode.Webview) {
        webview.onDidReceiveMessage(
            (message: any) => {
                const command = message.command;
                const text = message.text;

                switch (command) {
                    case "test":
                        vscode.window.showInformationMessage(text);
                        return;
                }
            },
            undefined,
            this._disposables
        );
    }

    public dispose() {
        GradeFastHomePanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}