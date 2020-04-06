
/* script version: 0.1.0 */

/************************************* Debug / Logging ***********************************************/
let debug = false;
let force = false;


/************************************* Vor dem Start Anpassen ***********************************************/

let telegramUser = 'Issi';

let driveTimeDp = 'husq-automower.0.mower.statistics.mowingTimeDaily';

let husqvarna = 'husq-automower.0.mower.statistics.coveredDistanceDaily';

let alertMessage = 'Bitte hir denn Text der als Warnung ausgegeben werden soll eintragen';

/************************************* dp Variablen ***********************************************/

let preafix = '0_userdata.0';
let drive_time = 'husqvarna' + '.' + 'drive_time';
let rest_range = 'husqvarna' + '.' + 'rest_range';
let knife_changed = 'husqvarna' + '.' + 'knife_changed';
let driving_route = 'husqvarna' + '.' + 'driving_route';
let warning_limit = 'husqvarna' + '.' + 'warning_limit';
let changing_knife = 'husqvarna' + '.' + 'changing_knife';
let telegram_changing_message = 'husqvarna' + '.' + 'telegram_changing_message';

/******************************************************* restRange Function ***************************************************************************/

let differenz;
let range_new;
let range_old;
let Range = null;
let RangePuffer = null;
let warning_limit_state = null;

/* main function für die Berechnung */
function restRange() {

    /* Warnlimit State wird abgefragt */
    warning_limit_state = getState(preafix + '.' + warning_limit).val;

    if (debug) console.log('Warnlimit in km: ' + warning_limit_state);

    /* Prüfung ob Rest Range grösser als 0 ist */
    if (Range > 0) {

        /* Differenz vom neuen und alten wert */
        differenz = convertMeter((range_new - range_old));

        /* prüfen ob Differenz kleiner 0 ist, wenn kleiner 0 Range wird dann nicht verändert */
        if (differenz <= 0) {

            Range = (Range - 0);

            if (debug) console.log('Range kleiner als 0: ' + Range);

        } else {

            /* Range Puffer wird für weitere Prüfungen erzeugt */
            RangePuffer = (Range - differenz);

            /* prüfen ob Range Puffer kleiner 0 ist, wenn kleiner 0 Range wird auf 0 gesetzt */
            if (RangePuffer <= 0) {

                Range = 0

            } else {
                /* Differenz wird von Range abgezogen */
                Range = (Range - differenz);

            }

            if (debug) console.log('Range größer als 0: ' + Range);

        }

        if (debug) console.log('differenz ' + differenz);
    }

    if (debug) console.log('rest_range: ' + Math.round(Range * 1000) / 1000);

    if (debug) console.log('driving_route: ' + Math.round(convertMeter(range_new) * 1000) / 1000);

    /* States werden geschrieben und in km umgerechnet */
    setState(preafix + '.' + driving_route, Math.round(convertMeter(range_new) * 1000) / 1000, true);

    setState(preafix + '.' + rest_range, Math.round(Range * 1000) / 1000, true);

    /* prüfen ob Range gleich 0 ist, wenn 0 dann wird Telegramm Nachricht gesendet und state geschrieben */
    if (Range === 0) {

        if (telegramMessage == true && telegramSend == false) telegramAlert(alertMessage);

        setState(preafix + '.' + changing_knife, true, true);

       /* Warnung im iobroker log wird ausgegeben */
        console.warn(alertMessage);

        if (debug) console.log('Telegramm Nachricht: ' + alertMessage);

    }

}

/******************************************************* convert Function ***************************************************************************/
/* Konvertiert km in Meter um */
function convertKM(km) {

    if (Number.isNaN(km)) {

        return 0;
    }

    return km * 1000;
};

/* Konvertiert Meter in km um */
function convertMeter(m) {

    if (Number.isNaN(m)) {

        return 0;
    }

    return m / 1000;
};


/******************************************************* driveTime Function ***************************************************************************/

/* Fahrzeit wird auf Minuten in Stunden und Minuten umgerechnet */
function driveTime() {

    let time = getState(driveTimeDp).val;

    let stunden = Math.floor(time / 60);

    let minuten = Math.floor(time % 60);

    minuten = (minuten > 9) ? minuten : "0" + minuten; // Führende "0"

    let newTime = stunden + "h " + minuten + "min";

    setState(preafix + '.' + drive_time, newTime, true);

    if (debug) console.log('Fahrzeit: ' + newTime);

}

/******************************************************* Telegramm Function ***************************************************************************/

let telegramMessage;

let telegramSend = false;

/* Telegramm state wird initialisiert */
function telegramInit() {

    telegramMessage = getState(preafix + '.' + telegram_changing_message).val;

    console.log('telegramMessage Status: ' + telegramMessage);

}

/* Telegramm sende function */
function telegramAlert(text) {

    telegramSend = true;

    sendTo("telegram", "send", {
        text: text,
        user: telegramUser
    });
    console.error(text);
}

/******************************************************* Trigger ***************************************************************************/

/* Telegramm sende Status wir um 0 Uhr zurückgestellt  */
schedule('0 0 * * *', function () {
    telegramSend = false;

    if (debug) console.log('Telegram sende Status wurde um 0 Uhr zurückgesetzt');

});


on({ id: husqvarna, change: "ne" }, function (obj) {
    range_new = obj.state.val;
    range_old = obj.oldState.val;

    Range = getState(preafix + '.' + rest_range).val;

    restRange();

});

on({ id: driveTimeDp, change: "ne" }, function (obj) {

    driveTime();

});


on({ id: preafix + '.' + telegram_changing_message, change: "ne" }, function (obj) {

    telegramInit();

});


on({ id: preafix + '.' + warning_limit, change: "ne" }, function (obj) {


    Range = obj.state.val;

    setState(preafix + '.' + rest_range, Range, true);

    if (debug) console.log('Limit wurde geändert');

});

on({ id: preafix + '.' + knife_changed, change: "any" }, function (obj) {

    Range = getState(preafix + '.' + warning_limit).val;

    differenz = 0;

    telegramSend = false;

    setState(preafix + '.' + changing_knife, false, true);

    setState(preafix + '.' + rest_range, Range, true);

    if (debug) console.log('Messer wurden gewechselt');

});

driveTime()
/******************************************************* statesToCreate Function ***************************************************************************/

    let statesToCreate = [

        [changing_knife, {
            'name': 'Messer wechseln', 'type': 'boolean', 'read': true, 'write': false,
            'role': 'switch', 'def': false
        }],

        [telegram_changing_message, {
            'name': 'Messer wechseln Telegram Meldung senden einschalten', 'type': 'boolean', 'read': true, 'write': true,
            'role': 'switch', 'def': false
        }],

        [knife_changed, {
            'name': 'Messer gewechselt', 'type': 'boolean', 'read': true, 'write': true,
            'role': 'button', 'def': true
        }],

        [warning_limit, {
            'name': 'Messer wechseln limit', 'type': 'number', 'read': true, 'write': true,
            'role': 'state', 'def': 0, 'unit': 'km'
        }],

        [rest_range, {
            'name': 'km bis zum Messer wechsel', 'type': 'number', 'read': true, 'write': false,
            'role': 'state', 'def': 0, 'unit': 'km'
        }],

        [drive_time, {
            'name': 'Fahrzeit Heute', 'type': 'string', 'read': true, 'write': false,
            'role': 'state'
        }],

        [driving_route, {
            'name': 'Fahrstrecke in Km', 'type': 'number', 'read': true, 'write': false,
            'role': 'state', 'def': 0, 'unit': 'km'
        }],

    ];
    createUserStates(preafix, force, statesToCreate, function () {
        if (debug) console.log('Jetzt sind alle States abgearbeitet und wir können nun fortfahren');
        telegramInit();
    });




/******************************************************* script zur Datenpunkt Erstellung ***************************************************************************/
/**
* Create states under 0_userdata.0 or javascript.x
* Current Version:     https://github.com/Mic-M/iobroker.createUserStates
* Support:             https://forum.iobroker.net/topic/26839/
* Autor:               Mic (ioBroker) | Mic-M (github)
* Version:             1.0 (17 January 2020)
* Example:
* -----------------------------------------------
let statesToCreate = [
    ['Test.Test1', {'name':'Test 1', 'type':'string', 'read':true, 'write':true, 'role':'info', 'def':'Hello' }],
    ['Test.Test2', {'name':'Test 2', 'type':'string', 'read':true, 'write':true, 'role':'info', 'def':'Hello' }],
];
createUserStates('0_userdata.0', false, statesToCreate, function(){
log('Jetzt sind alle States abgearbeitet und wir können nun fortfahren, z.B. nächste Funktion main() aufrufen.');
main();
});
* -----------------------------------------------
* PLEASE NOTE: Per https://github.com/ioBroker/ioBroker.javascript/issues/474, the used function setObject() 
*              executes the callback PRIOR to completing the state creation. Therefore, we use a setTimeout and counter. 
* -----------------------------------------------
* @param {string} where          Where to create the state: e.g. '0_userdata.0' or 'javascript.x'.
* @param {boolean} force         Force state creation (overwrite), if state is existing.
* @param {array} statesToCreate  State(s) to create. single array or array of arrays
* @param {object} [callback]     Optional: a callback function -- This provided function will be executed after all states are created.
*/


function createUserStates(where, force, statesToCreate, callback = undefined) {

    const WARN = false; // Throws warning in log, if state is already existing and force=false. Default is false, so no warning in log, if state exists.
    const LOG_DEBUG = false; // To debug this function, set to true
    // Per issue #474 (https://github.com/ioBroker/ioBroker.javascript/issues/474), the used function setObject() executes the callback 
    // before the state is actual created. Therefore, we use a setTimeout and counter as a workaround.
    // Increase this to 100, if it is not working.
    const DELAY = 50; // Delay in milliseconds (ms)


    // Validate "where"
    if (where.endsWith('.')) where = where.slice(0, -1); // Remove trailing dot
    if ((where.match(/^javascript.([0-9]|[1-9][0-9])$/) == null) && (where.match(/^0_userdata.0$/) == null)) {
        log('This script does not support to create states under [' + where + ']', 'error');
        return;
    }

    // Prepare "statesToCreate" since we also allow a single state to create
    if (!Array.isArray(statesToCreate[0])) statesToCreate = [statesToCreate]; // wrap into array, if just one array and not inside an array

    let numStates = statesToCreate.length;
    let counter = -1;
    statesToCreate.forEach(function (param) {
        counter += 1;
        if (LOG_DEBUG) log('[Debug] Currently processing following state: [' + param[0] + ']');

        // Clean
        let stateId = param[0];
        if (!stateId.startsWith(where)) stateId = where + '.' + stateId; // add where to beginning of string
        stateId = stateId.replace(/\.*\./g, '.'); // replace all multiple dots like '..', '...' with a single '.'
        const FULL_STATE_ID = stateId;

        if (($(FULL_STATE_ID).length > 0) && (existsState(FULL_STATE_ID))) { // Workaround due to https://github.com/ioBroker/ioBroker.javascript/issues/478
            // State is existing.
            if (WARN && !force) log('State [' + FULL_STATE_ID + '] is already existing and will no longer be created.', 'warn');
            if (!WARN && LOG_DEBUG) log('[Debug] State [' + FULL_STATE_ID + '] is already existing. Option force (=overwrite) is set to [' + force + '].');

            if (!force) {
                // State exists and shall not be overwritten since force=false
                // So, we do not proceed.
                numStates--;
                if (numStates === 0) {
                    if (LOG_DEBUG) log('[Debug] All states successfully processed!');
                    if (typeof callback === 'function') { // execute if a function was provided to parameter callback
                        if (LOG_DEBUG) log('[Debug] An optional callback function was provided, which we are going to execute now.');
                        return callback();
                    }
                } else {
                    // We need to go out and continue with next element in loop.
                    return; // https://stackoverflow.com/questions/18452920/continue-in-cursor-foreach
                }
            } // if(!force)
        }

        /************
         * State is not existing or force = true, so we are continuing to create the state through setObject().
         ************/
        let obj = {};
        obj.type = 'state';
        obj.native = {};
        obj.common = param[1];
        setObject(FULL_STATE_ID, obj, function (err) {
            if (err) {
                log('Cannot write object for state [' + FULL_STATE_ID + ']: ' + err);
            } else {
                if (LOG_DEBUG) log('[Debug] Now we are creating new state [' + FULL_STATE_ID + ']')
                let init = null;
                if (param[1].def === undefined) {
                    if (param[1].type === 'number') init = 0;
                    if (param[1].type === 'boolean') init = false;
                    if (param[1].type === 'string') init = '';
                } else {
                    init = param[1].def;
                }
                setTimeout(function () {
                    setState(FULL_STATE_ID, init, true, function () {
                        if (LOG_DEBUG) log('[Debug] setState durchgeführt: ' + FULL_STATE_ID);
                        numStates--;
                        if (numStates === 0) {
                            if (LOG_DEBUG) log('[Debug] All states processed.');
                            if (typeof callback === 'function') { // execute if a function was provided to parameter callback
                                if (LOG_DEBUG) log('[Debug] Function to callback parameter was provided');
                                return callback();
                            }
                        }
                    });
                }, DELAY + (20 * counter));
            }
        });
    });
}
