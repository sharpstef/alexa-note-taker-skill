/* CONSTANTS */
const Alexa = require('ask-sdk');
const constants = require('./constants');
const util = require('./util.js')

// i18n library dependency, we use it below in a localization interceptor
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
// i18n strings for all supported locales
const languageStrings = {
    //  'de': require('languages\de.js'),
    //  'de-DE': require('languages\de-DE.js'),
    //  'en' : require('languages\en.js'),
    //  'en-AU': require('languages\en-AU.js'),
    //  'en-CA': require('languages\en-CA.js'),
    //  'en-GB': require('languages\en-GB.js'),
    //  'en-IN': require('languages\en-IN.js'),
    'en-US': require('languages\en-US.js'),
    //  'es' : require('languages\es.js'),
    //  'es-ES': require('languages\es-ES.js'),
    //  'es-MX': require('languages\es-MX.js'),
    //  'es-US': require('languages\es-US.js'),
    //  'fr' : require('languages\fr.js'),
    //  'fr-CA': require('languages\fr-CA.js'),
    //  'fr-FR': require('languages\fr-FR.js'),
    //  'it' : require('languages\it.js'),
    //  'it-IT': require('languages\it-IT.js'),
    //  'ja' : require('languages\ja.js'),
    //  'ja-JP': require('languages\ja-JP.js'),
    //  'pt' : require('languages\pt.js'),
    //  'pt-BR': require('languages\pt-BR.js'),
};

// This request interceptor will bind a translation function 't' to the handlerInput
const LocalizationInterceptor = {
    process(handlerInput) {
        const localizationClient = i18n.use(sprintf).init({
            lng: Alexa.getLocale(handlerInput.requestEnvelope),
            resources: languageStrings,
        });
        localizationClient.localize = function localize() {
            const args = arguments;
            const values = [];
            for (let i = 1; i < args.length; i += 1) {
                values.push(args[i]);
            }
            const value = i18n.t(args[0], {
                returnObjects: true,
                postProcess: 'sprintf',
                sprintf: values,
            });
            if (Array.isArray(value)) {
                return value[Math.floor(Math.random() * value.length)];
            }
            return value;
        };
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        requestAttributes.t = function translate(...args) {
            return localizationClient.localize(...args);
        };
    },
};

const LogRequestInterceptor = {
	process(handlerInput) {
        if (debug) {
            console.log(`REQUEST ENVELOPE = ${JSON.stringify(handlerInput.requestEnvelope)}`
            );
        }
	}
};

const LoggingResponseInterceptor = {
    process(handlerInput, response) {
      if (debug) {
        console.log(`RESPONSE ENVELOPE = ${JSON.stringify(response)}`);
      }
    }
};


/**
 * Handler for when a skill is launched. Delivers a response based on if a user is new or
 * returning.
 */
const LaunchHandler = {
    canHandle(handlerInput) {
        return util.parseIntent(handlerInput) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const { attributesManager, responseBuilder } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        let sessionAttributes = attributesManager.getSessionAttributes();
        console.info(`Launch Request`);

        let speechOutput = `${requestAttributes.t('WELCOME')} ${requestAttributes.t('MAIN_MENU')}`;
        let repromptOutput = requestAttributes.t('MAIN_MENU');

        sessionAttributes[constants.STATE] = constants.STATES.MENU;
        attributesManager.setSessionAttributes(sessionAttributes);

        return responseBuilder
        .speak(speechOutput)
        .reprompt(repromptOutput)
        .getResponse();
    }
};

const NoteIntentHandler = {
    canHandle(handlerInput) {
        return util.parseIntent(handlerInput) === 'NoteIntent';
    },
    handle(handlerInput) {
        const { attributesManager, responseBuilder } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        let sessionAttributes = attributesManager.getSessionAttributes();
        console.info(`${sessionAttributes[constants.STATE]}, NoteIntent`);

        const text = util.getSlotResolution(handlerInput, "NOTE");
        console.info("Note is: ",text);
        sessionAttributes[constants.STATE] = constants.STATES.NOTE;
        util.saveNoteLocal(handlerInput, text);
        attributesManager.setSessionAttributes(sessionAttributes);

        return responseBuilder
        .speak(`${requestAttributes.t('ADD_NOTE_CONFIRM')} ${requestAttributes.t('MAIN_MENU')}`)
        .reprompt(requestAttributes.t('MAIN_MENU'))
        .getResponse();
    }
};

const ReadIntentHandler = {
    canHandle(handlerInput) {
        return util.parseIntent(handlerInput) === 'ReadNote';
    },
    handle(handlerInput) {
        const { attributesManager, responseBuilder } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        let sessionAttributes = attributesManager.getSessionAttributes();
        console.info(`${sessionAttributes[constants.STATE]}, ReadNote`);

        let note = util.getNote(handlerInput);
        let speechOutput = requestAttributes.t('NO_NOTES');
        sessionAttributes[constants.STATE] = constants.STATES.READ;

        if(note) {
            speechOutput = requestAttributes.t('READ_NOTE').replace('$1',note);
        }

        attributesManager.setSessionAttributes(sessionAttributes);

        return responseBuilder
        .speak(`${speechOutput} ${requestAttributes.t('MAIN_MENU')}`)
        .reprompt(requestAttributes.t('MAIN_MENU'))
        .getResponse();
    }
};

const DeleteIntentHandler = {
    canHandle(handlerInput) {
        return util.parseIntent(handlerInput) === 'DeleteNote';
    },
    handle(handlerInput) {
        const { attributesManager, responseBuilder } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        let sessionAttributes = attributesManager.getSessionAttributes();
        console.info(`${sessionAttributes[constants.STATE]}, DeleteNote`);

        let note = util.getNote(handlerInput);
        let speechOutput = `${requestAttributes.t('NO_NOTES')} ${requestAttributes.t('MAIN_MENU')}`;

        if(note) {
            speechOutput = requestAttributes.t('DELETE_NOTE_CONFIRM')
                            .replace('$1',note);
            sessionAttributes[constants.STATE] = constants.STATES.DELETE;
        }

        attributesManager.setSessionAttributes(sessionAttributes);

        return responseBuilder
        .speak(speechOutput)
        .reprompt(requestAttributes.t('MAIN_MENU'))
        .getResponse();
    }
};

const DeleteAllIntentHandler = {
    canHandle(handlerInput) {
        return util.parseIntent(handlerInput) === 'DeleteAllNotes';
    },
    handle(handlerInput) {
        const { attributesManager, responseBuilder } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        let sessionAttributes = attributesManager.getSessionAttributes();
        console.info(`${sessionAttributes[constants.STATE]}, DeleteAllNotes`);
        
        let speechOutput = requestAttributes.t('DELETE_ALL_CONFIRM');
        sessionAttributes[constants.STATE] = constants.STATES.CLEAR;

        attributesManager.setSessionAttributes(sessionAttributes);

        return responseBuilder
        .speak(speechOutput)
        .reprompt(speechOutput)
        .getResponse();
    }
};

/**
 * Handler for all AMAZON.YesIntent requests. Calls delete utilities if
 * the session is currently in a DELETE or CLEAR state. 
 */
const YesHandler = {
    canHandle(handlerInput) {
        return util.parseIntent(handlerInput) === 'AMAZON.YesIntent';
    },
    handle(handlerInput) {
        const { attributesManager, responseBuilder } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        let sessionAttributes = attributesManager.getSessionAttributes();
        console.info(`${sessionAttributes[constants.STATE]}, AMAZON.YesIntent`);

        let speechOutput = requestAttributes.t('HELP');
        let repromptOutput = requestAttributes.t('MAIN_MENU');

        if(sessionAttributes[constants.STATE] == constants.STATES.DELETE) {
            util.deleteNote(handlerInput);
            speechOutput = requestAttributes.t('DELETED');
        } else if(sessionAttributes[constants.STATE] == constants.STATES.CLEAR) {
            util.deleteAllNotes(handlerInput);
            speechOutput = requestAttributes.t('DELETED_ALL');
        }

        sessionAttributes[constants.STATE] = constants.STATES.MENU;
        attributesManager.setSessionAttributes(sessionAttributes);

        return responseBuilder
        .speak(`${speechOutput} ${repromptOutput}`)
        .reprompt(repromptOutput)
        .getResponse();
    }
};

/**
 * Handler for all AMAZON.NoIntent requests. Clears session state from
 * DELETE/CLEAR if user responds no to a delete. 
 */
const NoHandler = {
    canHandle(handlerInput) {
        return util.parseIntent(handlerInput) === 'AMAZON.NoIntent';
    },
    handle(handlerInput) {
        const { attributesManager, responseBuilder } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        let sessionAttributes = attributesManager.getSessionAttributes();
        console.info(`${sessionAttributes[constants.STATE]}, AMAZON.NoIntent`);

        sessionAttributes[constants.STATE] = constants.STATES.MENU;
        attributesManager.setSessionAttributes(sessionAttributes);

        return responseBuilder
        .speak(requestAttributes.t('HELP'))
        .reprompt(requestAttributes.t('MAIN_MENU'))
        .getResponse();
    }
};

const HelpHandler = {
    canHandle(handlerInput) {
        return util.parseIntent(handlerInput) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const { attributesManager, responseBuilder } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        let sessionAttributes = attributesManager.getSessionAttributes();
        console.info(`${sessionAttributes[constants.STATE]}, AMAZON.HelpIntent`);

        return responseBuilder
        .speak(requestAttributes.t('HELP'))
        .reprompt(requestAttributes.t('MAIN_MENU'))
        .getResponse();
    }
};

/**
 * Central handler for the AMAZON.Stop Intent and AMAZON.CancelIntent.
 * Handler saves the notes to S3 and exits.
 */
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return ['AMAZON.CancelIntent','AMAZON.StopIntent'].includes(util.parseIntent(handlerInput));
    },
    handle(handlerInput) {
        const { attributesManager, responseBuilder } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        let sessionAttributes = attributesManager.getSessionAttributes();
        console.info(`${sessionAttributes[constants.STATE]}, Stop/Cancel`);

        util.saveNote(handlerInput);

        return responseBuilder
            .speak(requestAttributes.t('GOODBYE'))
            .withShouldEndSession(true)
            .getResponse();
    }
};

/**
 * Central handler for the SessionEndedRequest when the user says exit
 * or another session ending event occurs. 
 */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return util.parseIntent(handlerInput) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.info(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        const { responseBuilder } = handlerInput;
        
        util.saveNote(handlerInput);

        return responseBuilder.withShouldEndSession(true).getResponse();
    }
};

/**
 * Catch all for when the skill cannot find a canHandle() that returns true.
 */
const UnhandledIntentHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput) {
        const { attributesManager, responseBuilder } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        let sessionAttributes = attributesManager.getSessionAttributes();
        console.info(`${sessionAttributes[constants.STATE]}, Unhandled`);

        return responseBuilder
            .speak(`${requestAttributes.t('FALLBACK')} ${requestAttributes.t('MAIN_MENU')}`)
            .reprompt(requestAttributes.t('MAIN_MENU'))
            .getResponse();
    }
};

/**
 * Central error handler
 */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const { attributesManager, responseBuilder } = handlerInput;
        console.error(`Error handled: ${error.message}`);
        console.error('Full error: ', error);

        const requestAttributes = attributesManager.getRequestAttributes();

        return responseBuilder
            .speak(`${requestAttributes.t('ERROR')} ${requestAttributes.t('MAIN_MENU')}`)
            .reprompt(requestAttributes.t('MAIN_MENU'))
            .getResponse();
    }
};

/* LAMBDA SETUP */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchHandler,
        CancelAndStopIntentHandler,
        NoteIntentHandler,
        ReadIntentHandler,
        DeleteIntentHandler,
        DeleteAllIntentHandler,
        YesHandler,
        NoHandler,
        HelpHandler,
        SessionEndedRequestHandler,
        UnhandledIntentHandler
    )
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(LocalizationInterceptor, LogRequestInterceptor)
    .addResponseInterceptors(LoggingResponseInterceptor)
    .lambda();