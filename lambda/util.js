const AWS = require('aws-sdk');
const constants = require('./constants');

const bucketName = process.env.s3bucket;

const s3Client = new AWS.S3({
    signatureVersion: 'v4'
});

module.exports = {
    /**
     * Returns the target intent 
     * 
     * @param {Object} handlerInput 
     */
    parseIntent(handlerInput) {
        if(handlerInput.requestEnvelope.request.type === 'IntentRequest') {
            return handlerInput.requestEnvelope.request.intent.name;
        } else {
            return handlerInput.requestEnvelope.request.type;
        }
    },

    /**
     * Saves contents of AMAZON.SearchQuery slot to array in session attributes
     * 
     * @param {Object} handlerInput 
     * @param {String} content 
     */
    saveNoteLocal(handlerInput, content) {
        let { attributesManager } = handlerInput;
        let sessionAttributes = attributesManager.getSessionAttributes();
        
        let notes = sessionAttributes.hasOwnProperty(constants.NOTES) ? sessionAttributes[constants.NOTES] : [];
        notes.push(content);
        sessionAttributes[constants.NOTES] = notes;

        attributesManager.setSessionAttributes(sessionAttributes);
    },

    /**
     * Save all notes for a session to an object in an S3 bucket. 
     * 
     * @param {Object} handlerInput 
     */
    saveNote(handlerInput) {
        let { attributesManager } = handlerInput;
        let sessionAttributes = attributesManager.getSessionAttributes();
        let key = new Date().toISOString();

        if(sessionAttributes[constants.NOTES].length > 0) {
            const params = {
                Bucket: bucketName, 
                Key: key, 
                Body: sessionAttributes[constants.NOTES].join('\n')
            };
            
            s3Client.putObject(params, function(err, data) {
                if (err) console.error(err, err.stack); 
                else     console.info("SAVE NOTE: ",data);           
            });
        }

    },

    /**
     * Gets the last note from the local session attributes. 
     * 
     * @param {Object} handlerInput 
     * @returns 
     */
    getNote(handlerInput) {
        let { attributesManager } = handlerInput;
        let sessionAttributes = attributesManager.getSessionAttributes();
        let notes = sessionAttributes[constants.NOTES];

        if(notes && notes.length > 0) {
            return notes[notes.length - 1];
        } else {
            return false;
        }
    },

    /**
     * Deletes the last note from the local session attributes.
     * 
     * @param {Object} handlerInput 
     * @returns 
     */
    deleteNote(handlerInput) {
        let { attributesManager } = handlerInput;
        let sessionAttributes = attributesManager.getSessionAttributes();
        let notes = sessionAttributes[constants.NOTES];

        if(notes && notes.length > 0) {
            return notes.pop();
        } else {
            return false;
        }
    },

    /**
     * Deletes all notes stores an the S3 bucket. 
     * TODO: Update to only delete notes for the user. 
     * 
     * @param {Object} handlerInput 
     */
    deleteAllNotes(handlerInput) {
        let { attributesManager } = handlerInput;
        let sessionAttributes = attributesManager.getSessionAttributes();
        sessionAttributes[constants.NOTES] = [];

        attributesManager.setSessionAttributes(sessionAttributes);

        s3Client.listObjectsV2({Bucket: bucketName, MaxKeys: 1000}, function(err, data) {
            if (err) console.log(err, err.stack); 
            else {
                const notesRaw = data.Contents; 

                let notes = [];
                console.info("DELETE: ", data);
                if(notesRaw.length > 0) {
                    notesRaw.forEach(note => notes.push({"Key": note.Key}));
        
                    const params = {
                        Bucket: bucketName, 
                        Delete: {
                            Objects: notes
                        }
                    };
                    
                    s3Client.deleteObjects(params, function(err, data) {
                        if (err) console.error(err, err.stack); 
                        else     console.info("DELETE ALL: ",data);           
                    });
                }
            }
        });

    },

    /**
     * Gets the root value of the slot even if synonyms are provided.
     *
     * @param {Object} handlerInput
     * @param {String} slot
     * @returns {String} The root value of the slot
     */
    getSlotResolution(handlerInput, slot) {
        const intent = handlerInput.requestEnvelope.request.intent;
        if (
            intent.slots[slot] &&
            intent.slots[slot].resolutions &&
            intent.slots[slot].resolutions.resolutionsPerAuthority[0]
        ) {
            const resolutions = intent.slots[slot].resolutions.resolutionsPerAuthority;

            for (let i = 0; i < resolutions.length; i++) {
                const authoritySource = resolutions[i];

                if (
                    authoritySource.authority.includes('amzn1.er-authority.echo-sdk.') &&
                    authoritySource.authority.includes(slot)
                ) {
                    if (authoritySource.status.code === 'ER_SUCCESS_MATCH') {
                        return authoritySource.values[0].value.name;
                    }
                }
            }
            return false;
        } else if (intent.slots[slot].value && !intent.slots[slot].resolutions) {
            // For built-in intents that haven't been extended with ER
            return intent.slots[slot].value;
        }

        return false;
    },
}
