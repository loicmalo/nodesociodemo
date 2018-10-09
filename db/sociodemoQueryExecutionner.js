const {Pool, Client} = require('pg');

const Sociodemo = require('../entities/sociodemo'); //sociodemo table
const Lib_insee = require('../entities/lib_insee'); //lib_insee table
//const Completion = require('../entities/completion'); //completion table
const Users = require('../entities/users'); //users table

var result;
var column;
var tokenChecked;


/**
 * Sets the SQL Query result in the result field according to the parameters.
 *
 * @param {string} param
 * @param {array} param
 */
function doQuery(param) {
    return Sociodemo.findAll(param).then(row => { //Success callback
        console.log("Query success");
        setResult(row);
    }).catch(err => { //Failure callback
        console.log("failed");
        throw err;
        console.log("Failure : " + err);
    }
    );
}

/**
 * Loïc : si celle la elle marche
 * @param {string} param
 * @param {array} param 
 */
function doColumnNameRetrieval(param) {
    console.log(param);
    return Lib_insee.findAll(param).then(row => {
        setColumnName(row);
    }).catch(err => {
        console.log("failed");
        throw err;
        console.log("failure : " + err);
    });
}

/**
 * Retrieve values used for autocompletion according to a given column_name
 * 
 * @param {string} col_name
 * @returns {unresolved}
 */
function doColumnRetrieval(col_name) {
    return Completion.findAll({attributes: ['col_value'],
        where: {
            col_name: col_name
        }
    }).then(row => { //Success callback
        console.log("Query success");
        setColumn(row);

    }).catch(err => { //Failure callback
        console.log("failed");
        throw err;
        console.log("Failure : " + err);
    }
    );
}

/**
 * Retrieve rows used for token checking according to a selected token and an ip.
 * 
 * @param {string} token
 * @param {string} ip
 * @returns {unresolved}
 */
function doTokenRetrieval(token, ip) {
    return Users.findAll({attributes: ['api_token', 'ip'],
        where: {
            api_token: token,
            ip: ip
        }
    }).then(row => { //Success callback
        console.log("Query success");
        setTokenChecked(row);

    }).catch(err => { //Failure callback
        console.log("failed");
        throw err;
        console.log("Failure : " + err);
    }
    );
}

async function asyncCheckToken(token, ip) {
    await doTokenRetrieval(token, ip);
    let tokenChecked = getTokenChecked();
    return tokenChecked;
}

async function asyncGetColumn(param) {
    await doColumnRetrieval(param);
    let column = getColumn();
    return column;
}

async function asyncGetQuery(param) {
    await doQuery(param);
    let result = getResult();
    return result;
}

//Loïc

async function asyncGetColumnName(param) {
    await doColumnNameRetrieval(param);
    let columnName = getColumnName();
    return columnName;
}

//********************************* GETTERS/SETTERS *********************************\\

function getResult() {
    return result;
}

function setResult(res) {
    result = res;
}

function getColumn() {
    return column;
}


function setColumn(res) {
    column = res;
}

//Loïc

function getColumnName() {
    return columnName;
}

function setColumnName(res) {
    columnName = res;
}
//
function getTokenChecked() {
    return tokenChecked;
}

function setTokenChecked(token) {
    tokenChecked = token;
}

exports.getResult = getResult;
exports.doQuery = doQuery;
exports.asyncGetQuery = asyncGetQuery;
exports.asyncGetColumn = asyncGetColumn;
exports.asyncCheckToken = asyncCheckToken;

//Loïc
exports.doColumnNameRetrieval = doColumnNameRetrieval;
exports.getColumnName = getColumnName;
exports.asyncGetColumnName = asyncGetColumnName;
