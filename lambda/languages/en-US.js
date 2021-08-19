  
module.exports = {
    translation: {
        WELCOME: 'This is My Notes. To save a note, just say "Alexa, ask my notes to take a note" followed by your message.',
        MAIN_MENU: 'You can ask me to take a note, read your last note, delete your last note, or delete all notes. What do you want to do?',

        READ_NOTE: '<s>Ok, here is your last note.</s> <voice name="Kendra">$1</voice> <break time="1s"/>',
        ADD_NOTE_CONFIRM: 'I\'ve made a note.',
        DELETE_NOTE_CONFIRM: 'Your last note was <voice name="Kendra">$1</voice>. You want to delete it, right?',
        DELETE_ALL_CONFIRM: 'You cannot recover your notes once they have been deleted. Are you sure you want to delete all of your notes?',
        DELETED: 'Ok, I\'ve deleted that note.',
        DELETED_ALL: 'Ok, I\'ve deleted all notes.',
        NO_NOTES: 'You don\'t have any recent notes.',

        HELP: 'To take a note just say "Alexa, ask my notes to take a note" followed by your message. I cannot take a note unless you ask me to first.',
            
        GOODBYE: 'You can view your notes in your admin\'s S3 bucket. Goodbye.',
        FALLBACK: 'It looks like I can\'t do that.',
        ERROR: 'Sorry, I had trouble doing what you asked. Please try again. '
    }
}