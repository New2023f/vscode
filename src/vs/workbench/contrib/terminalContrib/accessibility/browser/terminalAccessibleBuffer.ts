/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { KeyCode } from 'vs/base/common/keyCodes';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import * as dom from 'vs/base/browser/dom';
import { IEditorConstructionOptions } from 'vs/editor/browser/config/editorConfiguration';
import { EditorExtensionsRegistry } from 'vs/editor/browser/editorExtensions';
import { CodeEditorWidget, ICodeEditorWidgetOptions } from 'vs/editor/browser/widget/codeEditorWidget';
import { ITextModel } from 'vs/editor/common/model';
import { IModelService } from 'vs/editor/common/services/model';
import { LinkDetector } from 'vs/editor/contrib/links/browser/links';
import { localize } from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { TerminalSettingId } from 'vs/platform/terminal/common/terminal';
import { SelectionClipboardContributionID } from 'vs/workbench/contrib/codeEditor/browser/selectionClipboard';
import { getSimpleEditorOptions } from 'vs/workbench/contrib/codeEditor/browser/simpleEditorOptions';
import { ITerminalFont } from 'vs/workbench/contrib/terminal/common/terminal';
import { ITerminalInstance, IXtermTerminal } from 'vs/workbench/contrib/terminal/browser/terminal';
import type { Terminal } from 'xterm';
import { TerminalCapability } from 'vs/platform/terminal/common/capabilities/capabilities';
import { IQuickInputService, IQuickPick, IQuickPickItem } from 'vs/platform/quickinput/common/quickInput';
import { AudioCue, IAudioCueService } from 'vs/platform/audioCues/browser/audioCueService';
import { IContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { TerminalContextKeys } from 'vs/workbench/contrib/terminal/common/terminalContextKey';

const enum Constants {
	Scheme = 'terminal-accessible-buffer',
	Active = 'active',
	Hide = 'hide'
}

export class AccessibleBufferWidget extends DisposableStore {
	public static ID: string = Constants.Scheme;
	private _accessibleBuffer: HTMLElement;
	private _bufferEditor: CodeEditorWidget;
	private _editorContainer: HTMLElement;
	private _font: ITerminalFont;
	private _xtermElement: HTMLElement;
	private readonly _focusedContextKey: IContextKey<boolean>;
	private readonly _focusTracker: dom.IFocusTracker;
	private _inQuickPick = false;

	constructor(
		private readonly _instance: ITerminalInstance,
		private readonly _xterm: IXtermTerminal & { raw: Terminal },
		@IInstantiationService private readonly _instantiationService: IInstantiationService,
		@IModelService private readonly _modelService: IModelService,
		@IConfigurationService private readonly _configurationService: IConfigurationService,
		@IQuickInputService private readonly _quickInputService: IQuickInputService,
		@IAudioCueService private readonly _audioCueService: IAudioCueService,
		@IContextKeyService private readonly _contextKeyService: IContextKeyService,

	) {
		super();
		this._focusedContextKey = TerminalContextKeys.accessibleBufferFocus.bindTo(this._contextKeyService);
		const codeEditorWidgetOptions: ICodeEditorWidgetOptions = {
			isSimpleWidget: true,
			contributions: EditorExtensionsRegistry.getSomeEditorContributions([LinkDetector.ID, SelectionClipboardContributionID])
		};
		this._font = _xterm.getFont();
		// this will be defined because we await the container opening
		this._xtermElement = _xterm.raw.element!;
		const editorOptions: IEditorConstructionOptions = {
			...getSimpleEditorOptions(),
			lineDecorationsWidth: 6,
			dragAndDrop: true,
			cursorWidth: 1,
			fontSize: this._font.fontSize,
			lineHeight: this._font.charHeight ? this._font.charHeight * this._font.lineHeight : 1,
			fontFamily: this._font.fontFamily,
			wrappingStrategy: 'advanced',
			wrappingIndent: 'none',
			padding: { top: 2, bottom: 2 },
			quickSuggestions: false,
			renderWhitespace: 'none',
			dropIntoEditor: { enabled: true },
			accessibilitySupport: this._configurationService.getValue<'auto' | 'off' | 'on'>('editor.accessibilitySupport'),
			cursorBlinking: this._configurationService.getValue('terminal.integrated.cursorBlinking'),
			readOnly: true
		};
		this._accessibleBuffer = document.createElement('div');
		this._accessibleBuffer.setAttribute('role', 'document');
		this._accessibleBuffer.ariaRoleDescription = localize('terminal.integrated.accessibleBuffer', 'Terminal buffer');
		this._accessibleBuffer.classList.add('accessible-buffer');
		this._editorContainer = document.createElement('div');
		this._accessibleBuffer.tabIndex = -1;
		this._bufferEditor = this._instantiationService.createInstance(CodeEditorWidget, this._editorContainer, editorOptions, codeEditorWidgetOptions);
		this._focusTracker = this.add(dom.trackFocus(this._editorContainer));
		this.add(this._focusTracker.onDidFocus(() => this._focusedContextKey.set(true)));
		this.add(this._focusTracker.onDidBlur(() => this._focusedContextKey.reset()));
		this._accessibleBuffer.replaceChildren(this._editorContainer);
		this._xtermElement.insertAdjacentElement('beforebegin', this._accessibleBuffer);
		this._bufferEditor.layout({ width: this._xtermElement.clientWidth, height: this._xtermElement.clientHeight });
		this.add(this._bufferEditor);
		this._bufferEditor.onKeyDown((e) => {
			// tab moves focus mode will prematurely move focus to the next element before
			// xterm can be focused
			if (e.keyCode === KeyCode.Escape || e.keyCode === KeyCode.Tab) {
				e.stopPropagation();
				e.preventDefault();
				this._hide();
			}
		});
		this.add(this._configurationService.onDidChangeConfiguration(e => {
			if (e.affectedKeys.has(TerminalSettingId.FontFamily)) {
				this._font = _xterm.getFont();
			}
		}));
		this.add(this._xterm.raw.onWriteParsed(async () => {
			if (this._focusedContextKey.get()) {
				await this._updateEditor(true);
			}
		}));
		this.add(this._bufferEditor.onDidFocusEditorText(async () => {
			if (this._inQuickPick) {
				return;
			}
			// if the editor is focused via tab, we need to update the model
			// and show it
			await this._updateEditor();
			this._accessibleBuffer.classList.add(Constants.Active);
			this._xtermElement.classList.add(Constants.Hide);
		}));
		this._updateEditor();
	}

	private _hide(): void {
		this._accessibleBuffer.classList.remove(Constants.Active);
		this._xtermElement.classList.remove(Constants.Hide);
		this._xterm.raw.focus();
	}

	private async _updateModel(insertion?: boolean): Promise<void> {
		let model = this._bufferEditor.getModel();
		const lineCount = model?.getLineCount() ?? 0;
		if (insertion && model && lineCount > this._xterm.raw.rows) {
			const lineNumber = lineCount + 1;
			model.pushEditOperations(null, [{ range: { startLineNumber: lineNumber, endLineNumber: lineNumber, startColumn: 1, endColumn: 1 }, text: await this._getContent(lineNumber - 1) }], () => []);
		} else {
			model = await this._getTextModel(URI.from({ scheme: `${Constants.Scheme}-${this._instance.instanceId}`, fragment: await this._getContent() }));
		}
		if (!model) {
			throw new Error('Could not create accessible buffer editor model');
		}
		this._bufferEditor.setModel(model);
	}

	private async _updateEditor(insertion?: boolean): Promise<void> {
		await this._updateModel(insertion);
		const model = this._bufferEditor.getModel();
		if (!model) {
			return;
		}
		const lineNumber = model.getLineCount() - 1;
		const selection = this._bufferEditor.getSelection();
		// If the selection is at the top of the buffer, IE the default when not set, move it to the bottom
		if (selection?.startColumn === 1 && selection.endColumn === 1 && selection.startLineNumber === 1 && selection.endLineNumber === 1) {
			this._bufferEditor.setSelection({ startLineNumber: lineNumber, startColumn: 1, endLineNumber: lineNumber, endColumn: 1 });
		}
		this._bufferEditor.setScrollTop(this._bufferEditor.getScrollHeight());
	}

	async createQuickPick(): Promise<IQuickPick<IQuickPickItem> | undefined> {
		if (!this._focusedContextKey.get()) {
			await this.show();
		}
		this._inQuickPick = true;
		const commands = this._instance.capabilities.get(TerminalCapability.CommandDetection)?.commands;
		if (!commands?.length) {
			return;
		}
		const quickPickItems: IQuickPickItem[] = [];
		for (const command of commands) {
			const line = command.marker?.line;
			if (!line || !command.command.length) {
				continue;
			}
			quickPickItems.push(
				{
					label: localize('terminal.integrated.symbolQuickPick.labelNoExitCode', '{0}', command.command),
					meta: JSON.stringify({ line: line + 1, exitCode: command.exitCode })
				});
		}
		const quickPick = this._quickInputService.createQuickPick<IQuickPickItem>();
		quickPick.onDidAccept(() => {
			const item = quickPick.activeItems[0];
			const model = this._bufferEditor.getModel();
			if (!model || !item.meta) {
				return;
			}
			quickPick.hide();
			const data: { line: number; exitCode: number } = JSON.parse(item.meta);
			this._bufferEditor.setSelection({ startLineNumber: data.line, startColumn: 1, endLineNumber: data.line, endColumn: 1 });
			this._bufferEditor.revealLine(data.line);
			this._inQuickPick = false;
			return;
		});
		quickPick.onDidChangeActive(() => {
			const data = quickPick.activeItems?.[0]?.meta;
			if (data && JSON.parse(data).exitCode) {
				this._audioCueService.playAudioCue(AudioCue.error, true);
			}
		});
		quickPick.items = quickPickItems.reverse();
		return quickPick;
	}

	async show(): Promise<void> {
		await this._updateEditor();
		this._accessibleBuffer.tabIndex = -1;
		this._bufferEditor.layout({ width: this._xtermElement.clientWidth, height: this._xtermElement.clientHeight });
		this._accessibleBuffer.classList.add(Constants.Active);
		this._xtermElement.classList.add(Constants.Hide);
		this._bufferEditor.focus();
	}

	private async _getTextModel(resource: URI): Promise<ITextModel | null> {
		const existing = this._modelService.getModel(resource);
		if (existing && !existing.isDisposed()) {
			return existing;
		}

		return this._modelService.createModel(resource.fragment, null, resource, false);
	}

	private _getContent(startLine?: number): string {
		const lines: string[] = [];
		let currentLine: string = '';
		const buffer = this._xterm?.raw.buffer.active;
		if (!buffer) {
			return '';
		}
		const end = buffer.length;
		for (let i = startLine ?? 0; i <= end; i++) {
			const line = buffer.getLine(i);
			if (!line) {
				continue;
			}
			const isWrapped = buffer.getLine(i + 1)?.isWrapped;
			currentLine += line.translateToString(!isWrapped);
			if (currentLine && !isWrapped || i === end - 1) {
				lines.push(currentLine.replace(new RegExp(' ', 'g'), '\xA0'));
				currentLine = '';
			}
		}
		return lines.join('\n');
	}
}
