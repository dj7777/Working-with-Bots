// 
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
// 
// Microsoft Bot Framework: http://botframework.com
// 
// Bot Builder SDK Github:
// https://github.com/Microsoft/BotBuilder
// 
// Copyright (c) Microsoft Corporation
// All rights reserved.
// 
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import ses = require('../Session');
import actions = require('./DialogAction');
import consts = require('../consts');
import logger = require('../logger');
import async = require('async');
import { Dialog, IRecognizeContext, IRecognizeResult, IDialogResult } from './Dialog';
import { IntentRecognizerSet, IIntentRecognizerSetOptions, IIntentRecognizer, IIntentRecognizerResult } from './IntentRecognizerSet';
import { RegExpRecognizer } from './RegExpRecognizer';

export enum RecognizeMode { onBegin, onBeginIfRoot, onReply }

export interface IIntentDialogOptions extends IIntentRecognizerSetOptions {
    recognizeMode?: RecognizeMode;
} 

export class IntentDialog extends Dialog {
    private beginDialog: IBeginDialogHandler;
    private handlers = <IIntentHandlerMap>{};
    private recognizers: IntentRecognizerSet;
    private recognizeMode: RecognizeMode

    constructor(options: IIntentDialogOptions = {}) {
        super();
        this.recognizers = new IntentRecognizerSet(options);
        this.recognizeMode = options.recognizeMode || RecognizeMode.onBeginIfRoot;
    }

    public begin<T>(session: ses.Session, args: any): void {
        var mode = this.recognizeMode;
        var isRoot = (session.sessionState.callstack.length == 1);
        var recognize = (mode == RecognizeMode.onBegin || (isRoot && mode == RecognizeMode.onBeginIfRoot)); 
        if (this.beginDialog) {
            try {
                logger.info(session, 'IntentDialog.begin()');
                this.beginDialog(session, args, () => {
                    if (recognize) {
                        this.replyReceived(session);
                    }
                });
            } catch (e) {
                this.emitError(session, e);
            }
        } else if (recognize) {
            this.replyReceived(session);
        }
    }

    public replyReceived(session: ses.Session, recognizeResult?: IRecognizeResult): void {
        if (!recognizeResult) {
            var locale = session.preferredLocale();
            this.recognize({ message: session.message, locale: locale, dialogData: session.dialogData, activeDialog: true }, (err, result) => {
                if (!err) {
                    this.invokeIntent(session, <IIntentRecognizerResult>result);
                } else {
                    this.emitError(session, err);
                }
            });
        } else {
            this.invokeIntent(session, <IIntentRecognizerResult>recognizeResult);
        }
    }

    public dialogResumed(session: ses.Session, result: IDialogResult<any>): void {
        var activeIntent: string = session.dialogData[consts.Data.Intent];
        if (activeIntent && this.handlers.hasOwnProperty(activeIntent)) {
            try {
                this.handlers[activeIntent](session, result);
            } catch (e) {
                this.emitError(session, e);
            }
        } else {
            super.dialogResumed(session, result);
        }
    }

    public recognize(context: IRecognizeContext, cb: (err: Error, result: IRecognizeResult) => void): void {
        this.recognizers.recognize(context, cb);
    }

    public onBegin(handler: IBeginDialogHandler): this {
        this.beginDialog = handler;
        return this;
    }

    public matches(intent: string|RegExp, dialogId: string|actions.IDialogWaterfallStep[]|actions.IDialogWaterfallStep, dialogArgs?: any): this {
        // Find ID and verify unique
        var id: string;
        if (intent) {
            if (typeof intent === 'string') {
                id = intent;
            } else {
                id = (<RegExp>intent).toString();
                this.recognizers.recognizer(new RegExpRecognizer(id, <RegExp>intent));
            }
        }
        if (this.handlers.hasOwnProperty(id)) {
            throw new Error("A handler for '" + id + "' already exists.");
        }

        // Register handler
        if (Array.isArray(dialogId)) {
            this.handlers[id] = actions.waterfall(dialogId);
        } else if (typeof dialogId === 'string') {
            this.handlers[id] = actions.DialogAction.beginDialog(<string>dialogId, dialogArgs);
        } else {
            this.handlers[id] = actions.waterfall([<actions.IDialogWaterfallStep>dialogId]);
        }
        return this;
    }

    public matchesAny(intents: string[]|RegExp[], dialogId: string|actions.IDialogWaterfallStep[]|actions.IDialogWaterfallStep, dialogArgs?: any): this {
        for (var i = 0; i < intents.length; i++) {
            this.matches(intents[i], dialogId, dialogArgs);
        }
        return this;
    }

    public onDefault(dialogId: string|actions.IDialogWaterfallStep[]|actions.IDialogWaterfallStep, dialogArgs?: any): this {
        // Register handler
        if (Array.isArray(dialogId)) {
            this.handlers[consts.Intents.Default] = actions.waterfall(dialogId);
        } else if (typeof dialogId === 'string') {
            this.handlers[consts.Intents.Default] = actions.DialogAction.beginDialog(<string>dialogId, dialogArgs);
        } else {
            this.handlers[consts.Intents.Default] = actions.waterfall([<actions.IDialogWaterfallStep>dialogId]);
        }
        return this;
    }

    public recognizer(plugin: IIntentRecognizer): this {
        // Append recognizer
        this.recognizers.recognizer(plugin);
        return this;
    }

    private invokeIntent(session: ses.Session, recognizeResult: IIntentRecognizerResult): void {
        var activeIntent: string;
        if (recognizeResult.intent && this.handlers.hasOwnProperty(recognizeResult.intent)) {
            logger.info(session, 'IntentDialog.matches(%s)', recognizeResult.intent);
            activeIntent = recognizeResult.intent;                
        } else if (this.handlers.hasOwnProperty(consts.Intents.Default)) {
            logger.info(session, 'IntentDialog.onDefault()');
            activeIntent = consts.Intents.Default;
        }
        if (activeIntent) {
            try {
                session.dialogData[consts.Data.Intent] = activeIntent;
                this.handlers[activeIntent](session, recognizeResult);
            } catch (e) {
                this.emitError(session, e);
            }
        } else {
            logger.warn(session, 'IntentDialog - no intent handler found for %s', recognizeResult.intent);
        }
    }

    private emitError(session: ses.Session, err: Error): void {
        var m = err.toString();
        err = err instanceof Error ? err : new Error(m);
        session.error(err);
    }
}

interface IIntentHandlerMap {
    [id: string]: IDialogHandler<any>;
}
