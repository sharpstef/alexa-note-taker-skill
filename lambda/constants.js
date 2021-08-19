module.exports = Object.freeze({
    // define the application states to handle the different interactions
    STATES: {
      MENU: '_MENU_MODE',
      NOTE: '_NOTE_MODE',
      READ: '_READ_MODE',
      DELETE: '_DELETE_MODE',
      CLEAR: '_CLEAR_MODE'
    },

    STATE: 'SKILL_STATE',
    FIRST_RUN: 'NEW_USER',
    NOTES: 'SESSION_NOTES'
});