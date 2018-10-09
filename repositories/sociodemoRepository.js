var db = require('../db/sociodemoQueryExecutionner'); //DataBase functions.

function defaultQuery() {
  db.doQuery("SELECT * FROM test LIMIT 2", []);
  var result = db.getResult();
  return result;
}

function queryWithParam(queryJson) {
  var result = db.asyncGetQuery(queryJson);
  return result;
}

function queryWithParamStream(queryJson) {
  var result = db.asyncGetQueryStream(queryJson);
  return result;
}

function getColumnExample(param) {
  var result = db.asyncGetColumn(param);
  return result;
}

exports.defaultQuery = defaultQuery;
exports.queryWithParam = queryWithParam;
exports.queryWithParamStream = queryWithParamStream;
exports.getColumnExample = getColumnExample;
