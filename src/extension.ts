// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const fs = require('fs');
const autotip = require('./autotip');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "swagger-io" is now active!');

	// 注册代码建议提示，只有当按下“.”时才触发
	autotip(context);


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed

	// 	// Display a message box to the user 
	// 	vscode.window.showInformationMessage('Hello World!');
	// });

	let disposable = vscode.commands.registerTextEditorCommand('extension.helloWorld', (textEditor, edit) => {
		// The code you place here will be executed every time your command is executed
		try {
			const jsFile = textEditor.document.uri.fsPath;
			if (jsFile.includes('\\service\\') === false) {
				vscode.window.showErrorMessage('只能service文件夹内的js文件，才能使用此功能!');
				return;
			}
			//console.log('当前路径', jsFile);

			//传空获取全局配置信息vscode.workspace.getConfiguration()
			//获取工作区域配置信息vscode.workspace.getConfiguration('',textEditor.document.uri);			
			const workspaceConfig = vscode.workspace.getConfiguration();			
			const exeFile = workspaceConfig.get('Swagger.File');
			const configFile = workspaceConfig.get('Swagger.ConfigFile');

			if (!fs.existsSync(exeFile) || !fs.existsSync(configFile)) {
				vscode.window.showErrorMessage('请先在设置中添加配置文件【Swagger.ConfigFile】和执行文件【Swagger.File】');
				return;
			}

			let config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

			let projectName = jsFile.substr(0, jsFile.indexOf('\\src\\'));
			projectName = projectName.substr(projectName.lastIndexOf("\\") + 1);
			if (!config[projectName]) {
				vscode.window.showErrorMessage('当前项目配置文件中未获取到相关文档');
				return;
			}

			// let terminal = vscode.window.terminals.find(ele => ele.name === 'Swaager');
			// if (!terminal) {
			// 	terminal = vscode.window.createTerminal({ name: "Swaager" });
			// 	terminal.show(true);
			// }
			let cmdText = `${exeFile} ${jsFile} ${config[projectName].apidocs}`;
			console.log(cmdText);
			let terminal = vscode.window.createTerminal({ name: "Swaager" });
			terminal.show(true);
			terminal.sendText(cmdText);
			setTimeout(() => {
				terminal.dispose();
			}, 1000);
			vscode.window.showInformationMessage('打开Swagger接口程序成功!');
		} catch (ex) {
			vscode.window.showInformationMessage(ex);
		}

		console.log('您正在执行编辑器命令！');
		//console.log(textEditor, edit);


	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
