/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var db = require('../db/sociodemoQueryExecutionner'); //DataBase functions.

function columnNamesQuery(queryJson){
    var columnNames = db.asyncGetColumnName(queryJson);
    return columnNames;
}

exports.columnNamesQuery = columnNamesQuery;

