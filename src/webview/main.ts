/**
 * @fileoverview Register components from vscode/webview-ui-toolkit
 * @author Mihai Siia <mihai.siia.dev@gmail.com>
 */

import { provideVSCodeDesignSystem, vsCodeDivider, Divider, vsCodeButton, Button } from "@vscode/webview-ui-toolkit";

provideVSCodeDesignSystem().register(vsCodeButton());

const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function main() {
    const testButton = document.getElementById("test") as Button;
    testButton?.addEventListener("click", handleTestClick);
}

function handleTestClick() {
    vscode.postMessage({
        command: "createComment",
        text: "Click to Create a Comment",
    });
}

