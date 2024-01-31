import * as vscode from 'vscode';
import * as fs from 'fs';
import { GradeFastHomePanel } from './panels/gradefast-home-panel';

let commentID = 1; 

class NoteComment implements vscode.Comment {
	id: number;
	label: string | undefined; 
	savedBody: string | vscode.MarkdownString;  // for the cancel button
	constructor(
		public body: string | vscode.MarkdownString, 
		public mode: vscode.CommentMode, 
		public author: vscode.CommentAuthorInformation, 
		public parent?: vscode.CommentThread,
		public contextValue?: string,
		public commentController?: vscode.CommentController // Add commentController reference

	) {
		// constructor 
		this.id = ++commentID;
		this.savedBody = this.body;
	}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
/**
 * 
 * @param context 
 * @todo change the extension to activate when extension webview is opened.
 */
export function activate(context: vscode.ExtensionContext) {
	// context.subscriptions.push(vscode.commands.registerCommand('gradefast.testOpenFolder', () => {
	// 	const testFolder = './tests/';
	// 	fs.readdirSync(testFolder).forEach(file => {
			
	// 	})
	// }))
	// function gradefastWorkspace(folderPath) {
	// 	if (typeof folderPath == 'undefined') {
	// 		return;
	// 	}
	// 	if (!fs.existsSync(folderPath)) {
	// 		return;
	// 	}

	// 	let folderUri = vscode.Uri.file(folderPath);

	// 	vscode.commands.executeCommand('vscode.open');
	// }
	const startGradingCommand = vscode.commands.registerCommand("gradefast.startGrading", () => {
		GradeFastHomePanel.render(context.extensionUri);
	});

	context.subscriptions.push(startGradingCommand);
	// provides comments for the document with CommentController
	const commentController = vscode.comments.createCommentController('comment-sample', 'Comment API Sample');
	context.subscriptions.push(commentController);

	// Controls where gutter decorations that allow adding comments are shown 
	commentController.commentingRangeProvider = {
		provideCommentingRanges: (document: vscode.TextDocument, token: vscode.CancellationToken) => {
			const lineCount = document.lineCount;
			return [new vscode.Range(0, 0, lineCount - 1, 0)];
		}
	};

	context.subscriptions.push(vscode.commands.registerCommand('gradefast.createComment', (reply: vscode.CommentReply) => {
		replyNote(reply);
	}));


	// delete parent notes
	context.subscriptions.push(vscode.commands.registerCommand('gradefast.deleteComment', (comment: NoteComment) => {
		const thread = comment.parent;
		if (!thread) {
			return;
		}

		thread.comments = thread.comments.filter(cmt => (cmt as NoteComment).id !== comment.id);

		if (thread.comments.length === 0) {
			thread.dispose();
		}
		}));

	// cancels the edits when editing comment
	context.subscriptions.push(vscode.commands.registerCommand('gradefast.cancelsaveNote', (comment: NoteComment) => {
		if (!comment.parent) {
			return;
		}

		comment.parent.comments = comment.parent.comments.map(cmt => {
			if ((cmt as NoteComment).id === comment.id) {
				cmt.body = (cmt as NoteComment).savedBody;
				cmt.mode = vscode.CommentMode.Preview;
			}

			return cmt;
		});
	}));

	// saves the edits when editing comment
	context.subscriptions.push(vscode.commands.registerCommand('gradefast.saveNote', (comment: NoteComment) => {
		if (!comment.parent) {
			return;
		}

		comment.parent.comments = comment.parent.comments.map(cmt => {
			if ((cmt as NoteComment).id === comment.id) {
				(cmt as NoteComment).savedBody = cmt.body;
				cmt.mode = vscode.CommentMode.Preview;
			}

			return cmt;
		});
	}));

	// allows for editing comments
	context.subscriptions.push(vscode.commands.registerCommand('gradefast.editComment', (comment: NoteComment) => {
		if (!comment.parent) {
			return;
		}

		comment.parent.comments = comment.parent.comments.map(cmt => {
			if ((cmt as NoteComment).id === comment.id) {
				cmt.mode = vscode.CommentMode.Editing;
			}

			return cmt;
		});
	}));

	// something to do with deleting the code
	context.subscriptions.push(vscode.commands.registerCommand('gradefast.dispose', () => {
		commentController.dispose();
	}));


	// edited so that we can add comments but does not have a reply bar
	function replyNote(reply: vscode.CommentReply) {
		const thread = reply.thread;
	
		// condition checks if there are no existing comments in the thread.
		if (!thread.comments.length) {
			const newComment = new NoteComment(reply.text, vscode.CommentMode.Preview, { name: 'Celine' }, thread, 'canDelete');
	
			// add the new comment to the thread's comments array
			thread.comments = [newComment];

			// set canReply to false to disable the reply bar
			thread.canReply = false;
		}
	}
	
}


// This method is called when your extension is deactivated
export function deactivate() {}