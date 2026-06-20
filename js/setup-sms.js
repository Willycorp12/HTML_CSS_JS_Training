/**
 * js/setup-sms.js
 * Handles SMS Gateway Settings logic.
 */

window.initSmsSetting = function() {
    console.log("initSmsSetting: Initializing interface...");
    
    // Make the config box draggable
    const configBox = document.getElementById('SMS_ConfigBox');
    const header = document.getElementById('SMS_Header');
    
    if (configBox && header && typeof makeElementDraggable === 'function') {
        makeElementDraggable(configBox, header);
    }

    console.log("initSmsSetting: Done.");
};