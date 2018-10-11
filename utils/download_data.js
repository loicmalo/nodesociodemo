/* 
 * Now is the path used for file creation
 */

//Libraries/modules
const fmanager = require('./file-manager_1');
const http = require('http');
const qp = require('./sociodemo-query-parser');
const repo = require('../repositories/sociodemoRepository');

//Local data
let path = '';
let nblignestot = 1000;
let creation = false;
let offset = 0;
let now = '';
let c = 0;
let abort = false;
let maxThousandRows = 199; //200 000 rows maximum.
let paramObj = {};
let token = '';

//NET
const base_host = 'http://localhost:3000';
const route = '/export';


//Main function
/**
 * This function starts the file creation with the given id now and the parameter object paramObj.
 * 
 * @param {String} now
 * @param {Object} paramObj
 * @returns {exception}
 */
async function createFile(now, paramObj) {
  try {
    console.log("Async file creation launched");
    path = './public/' + now + '.csv'; //Path for result file

    //Setting right parameter for request
    paramObj.offset = offset;
    param = JSON.stringify(paramObj);

    //Getting table results - recursive function.
    processListener(paramObj);

    //When recursive loop is finished.
    return;
  }
  catch (exception) {
    return exception;
  }

}

/**
 * Make recursive requests to retrieve data and append to the now file.
 * 
 * @param {Object} paramObj
 * @returns {undefined}
 */
function processListener(paramObj) {
  //check if we need to abort.
  if (c === 0) { //Add only one time the in-function listener.
    process.on('message', async (data) => {
      abort = data.statusDataNow.abort;
    });
  }

  if (abort) {
    process.send({status: "Avorté", id: now, nblignes: nblignestot});
    let filename = "./public/" + now + ".csv";
    fmanager.deleteFile(filename);
    process.disconnect(); //Disconnect process when aborted.
    return;
  }
  else {
    if (offset === 0 || c >= maxThousandRows) { //Maximum number of lignes
      process.send({status: "Fini", id: now, nblignes: nblignestot});
      process.disconnect(); //Disconnect process when finished.
      return;
    }
    else {
      c++;
      let param = JSON.stringify(paramObj);
      makeRequest(param, refreshObj);
    }
  }
}

/**
 * Uses the string param to connect to database and retrieve results.
 *  Returns the callback that refreshes the parameter Object.
 * 
 * @param {string} param
 * @param {object} refreshObj
 * @returns {undefined}
 */
function makeRequest(param, refreshObj) {
  let maxResults = 1000;
  try {
    let queryJson = qp.getQueryJson(param, maxResults);
    let result = repo.queryWithParam(queryJson);

    result.then(function (table) { //SUCCESS CALLBACK
      if (table === undefined) {
        throw "Table could not be acquired";
      }
      let JSONstr = fmanager.jsonCreator(table); //Turns table into returnable JSON.

      let nbResults = table.length;
      if (nbResults === maxResults) {
        lastId = '"' + String(table[table.length - 1]["dataValues"]["id"]) + '"'; //New offset if table.length = 100.
      }
      else {
        lastId = '0'; //Last page reached - going back to the begining.
      }

      let tableResultObject = new Object();
      tableResultObject.offset = JSON.parse(lastId);
      tableResultObject.sociodemo = JSON.parse(JSONstr);
      return refreshObj(paramObj, tableResultObject);

    }).catch(e => {
      console.log(e);
      return;
    });
  }
  catch (e) {
    console.log(e);
    return;
  }
  return;
};

/**
 * Refreshes the object with the new offset.
 * 
 * @param {Object} paramObj
 * @param {Object} resultSent
 * @returns {undefined}
 */
function refreshObj(paramObj, resultSent) {

  offset = resultSent.offset;
  paramObj.offset = offset;

  //Increase number of rows
  nblignestot += resultSent.sociodemo.length;

  //Creating file.
  fmanager.csvFileDownload(resultSent, path, creation);

  //reset data and send message
  process.send({status: "En cours", id: now, nblignes: nblignestot});
  processListener(paramObj);
}

//Message listener
process.on('message', async (data) => {
    console.log("Message recieved");
  try {
    //Retrieving message data
    console.log(data);
    now = data.id;
    let statusDataNow = data.statusDataNow;
    let param = data.param;
    if (param !== undefined) {
      paramObj = JSON.parse(param);
    }

    //Refreshing local data
    offset = data.offset;
    abort = statusDataNow.abort;
    token = data.token;
    //This listener is called after abortion, so we have to check abortion status in order to prevent it from recreate the file.
    if (!abort) {
      createFile(now, paramObj);
    }
  }
  catch (exception) {
    console.log("Err : " + exception);
  }

});