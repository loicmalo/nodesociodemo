//Download
var express = require('express');
var router = express.Router();
var qp = require('../../utils/sociodemo-query-parser'); //Function getQuery returns SQL from JSON.
var repo = require('../../repositories/sociodemoRepository');
var libRepo = require('../../repositories/libInseeRepository');
var fmanager = require('../../utils/file-manager');
var fs = require('fs');
var VerifyToken = require('../../auth/verifyToken');
const http = require('http');
const {fork} = require('child_process');
var process;
var statusData = [];
let maxNbLignesPerRequest = 1000;
const libAttributes = {
    attributes: ['id', 'id_indic', 'lib_indic', 'lib_indic_long', 'themes', 'sous_themes', 'annee_data', 'annee_pub']
};
/* GET home page of export. */
router.get('/', VerifyToken, function (req, res) {
    let param = req.query.param;
    let id = req.query.id;
    let abort = req.query.abort; //If abort = true, abort file creation.
    let token = req.query.token;
    const base_host = 'http://localhost:3000';
    const route = '/export';
    let offset = 0;
    try {
        if (param === undefined && id === undefined && abort === undefined) { //Case with no parameter given.
            console.log("param or id required");
        }

        //Create file creation request
        else if (param !== undefined && id === undefined && abort === undefined) {
            console.log(param);
            //Generate file + send id - append rows through thread if necessary.
            try {
                var queryJson = qp.getQueryJson(param, maxNbLignesPerRequest);
                var result = generateParamsCreationFile(queryJson);

                result.then(tableParams => { //SUCCESS CALLBACK
                    var table = tableParams[0];
                    var columnNames = tableParams[1];
                    forkFileCreation(res, table, columnNames, param, token);

                }).catch(e => {
                    console.log(e);
                    res.sendStatus(500);
                });

            } catch (e) { //TO FINISH LATER
                console.log(e);
                res.sendStatus(500);
                //res.render('error', {message: "Erreur", error: e});
            }

        }

        //Checking state route.
        else if (id !== undefined && param !== undefined && abort === undefined) { //Checking id before giving status

            if (process === undefined) {
                console.log("no process"); //Should reach base route first.
            } else if (statusData[id] !== undefined) { //Si on a bien l'id avec un status donné.
                //Retrieve current line decount and status, and give them to web client.

                let jsonResponse = {};
                jsonResponse.status = statusData[id].status;
                jsonResponse.lignes = statusData[id].nblignes;
                console.log(jsonResponse);
                res.json(jsonResponse);
            } else {
                res.send("ID not in base");
            }

            //Send status
            //"En cours" ou "terminé".
        }

        //Download file.
        else if (id !== undefined && param === undefined && abort === undefined) {
            let filename = "./public/" + id + ".csv";
            var stream = fs.createReadStream(filename);
            stream.once("close", function () {
                stream.destroy(); // makesure stream closed, not close if download aborted.
                fmanager.deleteFile(filename);
                delete statusData[id];
            }).on('error', (err) => {
                console.log(err);
                res.sendStatus(500);
            }).pipe(res);
        }

        //Abort file creation.
        else if (id !== undefined && param === undefined && abort !== undefined) {
            let filename = "./public/" + id + ".csv";
            if (statusData[id] !== undefined) {
                statusData[id].abort = true;
                if (process !== undefined) { //Cannot abort if file not in creation state.
                    process.send({statusDataNow: statusData[id], id: id, param: param, offset: offset, token: token});
                }

                delete statusData[id];
                fmanager.deleteFile(filename);
            }
            res.sendStatus(200);
        }
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }

});
/* -------------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------------- */
/* ---------------------------------------------------------* POST *--------------------------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------------- */





/* POST to home page of export. */
router.post('/', VerifyToken, function (req, res) {
    let param = req.body.param;
    let id = req.query.id;
    let abort = req.query.abort; //If abort = true, abort file creation.
    let token = req.query.token;
    let offset = 0;
    try {
        if (param === undefined && id === undefined && abort === undefined) { //Case with no parameter given.
            console.log("param or id required");
        }

        //Create file creation request
        else if (param !== undefined && id === undefined && abort === undefined) {
            console.log(param);
            var queryJson = qp.getQueryJson(param, maxNbLignesPerRequest);
            generateParamsCreationFile(queryJson);

        }

        //Checking state route.
        else if (id !== undefined && param !== undefined && abort === undefined) { //Checking id before giving status

            if (process === undefined) {
                console.log("no process"); //Should reach base route first.
            } else if (statusData[id] !== undefined) { //Si on a bien l'id avec un status donné.
                //Retrieve current line decount and status, and give them to web client.

                let jsonResponse = {};
                jsonResponse.status = statusData[id].status;
                jsonResponse.lignes = statusData[id].nblignes;
                console.log(jsonResponse);
                res.json(jsonResponse);
            } else {
                res.send("ID not in base");
            }

            //Send status
            //"En cours" ou "terminé".
        }

        //Download file.
        else if (id !== undefined && param === undefined && abort === undefined) {
            let filename = "./public/" + id + ".csv";
            var stream = fs.createReadStream(filename);
            stream.once("close", function () {
                stream.destroy(); // makesure stream closed, not close if download aborted.
                fmanager.deleteFile(filename);
                delete statusData[id];
            }).on('error', (err) => {
                console.log(err);
                res.sendStatus(500);
            }).pipe(res);
        }

        //Abort file creation.
        else if (id !== undefined && param === undefined && abort !== undefined) {
            let filename = "./public/" + id + ".csv";
            if (statusData[id] !== undefined) {
                statusData[id].abort = true;
                if (process !== undefined) { //Cannot abort if file not in creation state.
                    process.send({statusDataNow: statusData[id], id: id, param: param, offset: offset, token: token});
                }

                delete statusData[id];
                fmanager.deleteFile(filename);
            }
            res.sendStatus(200);
        }
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }

});
async function generateParamsCreationFile(queryJson) {

    // resolves concurrent creationFile queries : result and columnNames
    const tableParams = await Promise.all([repo.queryWithParam(queryJson), libRepo.columnNamesQuery(libAttributes)]);
    
    return tableParams;
}
/**
 * Creates the file, and forks the calculations of lines.
 * 
 * @param {Object} res
 * @param {object} table
 * @param {string} param
 * @param {string} token
 * @returns {undefined}
 */
function forkFileCreation(res, table, columnNames, param, token) {
    if (table === undefined) {
        throw "Table could not be acquired";
    }
    let JSONstr = fmanager.jsonCreator(table); //Turns table into returnable JSON.
    let JSONcolumnNames = fmanager.jsonCreator(columnNames);

    let nbResults = table.length;
    if (nbResults === maxNbLignesPerRequest) {
        id = '"' + String(table[table.length - 1]["dataValues"]["id"]) + '"'; //New offset if table.length = 100.
    } else {
        id = '0'; //Last page reached - going back to the begining.
    }
    console.log(id);
    parsedResponse = new Object();
    parsedResponse.offset = JSON.parse(id);
    parsedResponse.sociodemo = JSON.parse(JSONstr);
    offset = parsedResponse.offset; //Next offset

    parsedColumnNames = new Object();
    parsedColumnNames = JSON.parse(JSONcolumnNames);

    //END OF EXPORT THING.
    //BEGINING OF DOWNLOAD THING

    //Creating id into local base.
    let date = new Date();
    let hms = date.toLocaleTimeString(); // Heures:Minutes:Secondes.
    let YMD = date.toLocaleDateString(); // YEAR/MONTH/DAY.
    let milliseconds = date.getMilliseconds(); //Local milliseconds - closely ensure uniqness of id.

    let hmsArray = hms.split(':');
    let now = YMD + " " + hmsArray[0] + "h" + hmsArray[1] + "m" + hmsArray[2] + "s" + milliseconds + "ms"; //Path name
    statusData[now] = {};
    statusData[now].nblignes = 0;
    statusData[now].status = "En cours";
    statusData[now].abort = false;
    //Data initialization for file creation
    //
    let file_name = './public/' + now + '.csv';
    let creation = true;
    if (offset !== '0' && offset !== 0) { //Not finished - more than 1000 rows in result - sometimes offset wants to be number, sometimes it wants to be a string, whatever.
        statusData[now].nblignes += maxNbLignesPerRequest;
    } else { //Finished in one shot
        statusData[now].nblignes = parsedResponse.sociodemo.length; //Append the right amount of rows
        statusData[now].status = "Fini";
        statusData[now].abort = false;
        console.log(statusData[now]);
    }

//Create csv file and send id (and other stuff).
    fmanager.csvFileDownload(parsedResponse, file_name, creation, parsedColumnNames);
    res.send({id: now, status: statusData[now].status, nblignes: statusData[now].nblignes});
    //If not finished
    if (offset !== 0) {

//Huge calculus in background.
        process = fork('./utils/download_data.js');
        process.send({statusDataNow: statusData[now], id: now, param: param, offset: offset, token: token});
        process.on('message', async (data) => { //Refresh status and number of lignes
            console.log(data);
            if (statusData[data.id] !== undefined) {
                statusData[data.id].nblignes = data.nblignes;
                statusData[data.id].status = data.status;
            } else {
                //Wonder why this should happen.
            }
        });
    }
}

module.exports = router;
