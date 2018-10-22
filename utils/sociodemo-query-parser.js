/**
 * @file JSON parser
 * @author Th�o Gautier
 * @version 0.1
 *
 * Implements a JSON parser function that transformes the simplefied JSON into a readable statement for the ORM.
 *
 */

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const jsonLibInsee = {attributes:['id', 'id_indic', 'lib_indic', 'lib_indic_long', 'themes', 'sous_themes', 'niveau_geo', 'annee_data', 'annee_pub']};

/**
 * Parses the expression and returns an element to add to the where object in the final object.
 *
 * @param {string} operation - The operation used in the expression. Ex : "=", ">=", "!="...
 * @param {any} column - First operand of the expression.
 * @param {any} value - Second operand of the expression.
 * @param {any} option
 * @param {any} param
 *
 * @returns {Object} queryObj
 */
function parseExpression(operation, column, value, option, param) {

    let queryObj = {};
    let criteria = {};
    let crit = [];

    // Arithmetical
    if (operation === "=") {
        expr = Op.eq;
        criteria[expr] = value;
        queryObj[column] = criteria;
    } else if (operation === ">") {
        expr = Op.gt;
        criteria[expr] = value;
        queryObj[column] = criteria;
    } else if (operation === ">=") {
        expr = Op.gte;
        criteria[expr] = value;
        queryObj[column] = criteria;
    } else if (operation === "<") {
        expr = Op.lt;
        criteria[expr] = value;
        queryObj[column] = criteria;
    } else if (operation === "<=") {
        expr = Op.lte;
        criteria[expr] = value;
        queryObj[column] = criteria;
    } else if (operation === "!=") {
        expr = Op.ne;
        criteria[expr] = value;
        queryObj[column] = criteria;
    } else if (operation.toUpperCase() === "LIKE") {
        expr = Op.like;
        criteria[expr] = value;
        queryObj[column] = criteria;
    } else if (operation.toUpperCase() === "ILIKE") {
        expr = Op.iLike;
        criteria[expr] = value;
        queryObj[column] = criteria;
    }

    //Others :
    else if (operation.toUpperCase() === "IN") {
        expr = Op.in;
        if ((value[0] === '[' && value[value.length - 1] === ']') ||
                (value[0] === '(' && value[value.length - 1] === ')')) {
            value = value.substring(1, value.length - 1);
        }
        if (value.includes('|')) { //Sometimes, | is not parsed before sent as parameter.
            value = value.split('| ');
        } else {
            value = value.split(',');
        }
        criteria[expr] = value;
        queryObj[column] = criteria;
    } else if (operation.toUpperCase() === "NOT IN") {
        expr = Op.ne;
        criteria[expr] = value;
        queryObj[column] = criteria;
    } else if (operation.toUpperCase() === "BETWEEN") {
        expr = Op.between;
        if ((value[0] === '[' && value[value.length - 1] === ']') ||
                (value[0] === '(' && value[value.length - 1] === ')')) {
            value = value.substring(1, value.length - 1);
        }
        value = value.split(',');
        criteria[expr] = value;
        queryObj[column] = criteria;
    } else if (operation.toUpperCase() === "NOT BETWEEN") {
        expr = Op.notBetween;
        criteria[expr] = value;
        queryObj[column] = criteria;
    }



    // LOGICAL
    else if (operation.toUpperCase() === "OR") {
        expr = Op.or;
        crit[0] = column;
        crit[1] = value;
        queryObj[expr] = crit;
    } else if (operation.toUpperCase() === "AND") {
        expr = Op.and;
        crit[0] = column;
        crit[1] = value;
        queryObj[expr] = crit;
    }



    // GEOMETRY
    else if (operation.toUpperCase() === "DWITHIN") {
        value = JSON.stringify(value["features"][0]["geometry"]);
        let geom = Sequelize.fn('ST_GeomFromGeoJSON', value);
        let sridSet = Sequelize.fn('ST_SetSRID', geom, 4326);
        let where = Sequelize.where(Sequelize.fn('ST_DWITHIN', Sequelize.col(column), sridSet, param), true);
        return where;
    } else if (operation.toUpperCase() === "WITHIN") {
        value = JSON.stringify(value["features"][0]["geometry"]);
        let geom = Sequelize.fn('ST_GeomFromGeoJSON', value);
        let sridSet = Sequelize.fn('ST_SetSRID', geom, 4326);
        let where = Sequelize.where(Sequelize.fn('ST_WITHIN', Sequelize.col(column), sridSet), true);
        return where;
    } else if (operation.toUpperCase() === "CONTAINS") {
        value = JSON.stringify(value["features"][0]["geometry"]);
        let geom = Sequelize.fn('ST_GeomFromGeoJSON', value);
        let sridSet = Sequelize.fn('ST_SetSRID', geom, 4326);
        let where = Sequelize.where(Sequelize.fn('ST_CONTAINS', Sequelize.col(column), sridSet), true);
        return where;
    }

    return queryObj;
}

function parseWhere(queryJson) {
    var queryObj = {};
    var column = "";
    var value = "";
    var option = ""; //e.g. not true (yet to implement)
    var param = ""; //e.g. distance_meters in the function ST_DWithin

    if (queryJson["param"] !== undefined) {
        param = queryJson["param"];
    }
    if (queryJson["option"] !== undefined) {
        option = queryJson["option"];
    }

    if (queryJson["operation"] !== undefined && queryJson["column"] !== undefined && queryJson["value"] !== undefined) {
        //CASE COLUMN OP VALUE - ex : longitude > 50.02
        var operation = queryJson["operation"];
        column = queryJson["column"];
        value = queryJson["value"];

        console.log(column);

        queryObj = parseExpression(operation, column, value, option, param);

        //Creates column:{[Op.opname]: value};
    } else if (queryJson["operation"] !== undefined && queryJson["query_1"] !== undefined && queryJson["query_1"] !== undefined) {
        //CASE COLUMN OP VALUE - ex : latitude > 50.02 AND longitude < 48.86
        var operation = queryJson["operation"];
        let query_1 = queryJson["query_1"];
        let query_2 = queryJson["query_2"];

        let queryObj_1 = parseWhere(query_1);
        let queryObj_2 = parseWhere(query_2);

        queryObj = parseExpression(operation, queryObj_1, queryObj_2, option, param);

    } else if (queryJson["operation"] !== undefined && queryJson["geometry"] !== undefined) {
        //CASE COLUMN OP VALUE - ex : latitude > 50.02 AND longitude < 48.86
        var operation = queryJson["operation"];
        column = "pos";
        value = queryJson["geometry"];

        queryObj = parseExpression(operation, column, value, option, param);

    }

    return queryObj;
}




/**
 * This function returns a JSON Object used for querying. It contains all information required for the query.
 *
 * @param {Object} json - The JSON simplefied required for parsing.
 * @param {int} maxResults - The number of results per page.
 * @returns {Object} queryJson - The JSON used in the findAll query function.
 */
function parseJSON(json, maxResults) {

    var queryJson = {}; //Empty object.


    //Columns parsing :
    var attributes = [];
    if (json["columns"] !== undefined) {
        //Add each column.
        for (var key in json["columns"]) {
            if (json["columns"][key]["function"] !== undefined) {
                //console.log(json["columns"][key]["function"]);
            } else {
                attributes.push(json["columns"][key]);
            }


        }
        //Check if id is in "columns".
        if (!attributes.includes("id")) {
            attributes.unshift("id");
        }
        queryJson.attributes = attributes;

    }

    //Offset parsing :
    if (json["offset"] !== undefined) {
        var offset = json["offset"];
        if (offset === 0) {
            offset = '"' + offset + '"';
        }
    } else {
        throw "Expected offset";
    }

    //Where parsing :
    if (json["query"] !== undefined) {
        var query = json["query"];
        var queryObj = parseWhere(query);
        console.log(queryObj);
        if (queryObj["id"] === undefined) {
            queryObj["id"] = {[Op.gt]: offset};
        }
        queryJson.where = queryObj;


    } else {
        let where = {};
        where["id"] = {[Op.gt]: offset};
        queryJson.where = where;

    }
    //Limit parsing :
    queryJson.limit = maxResults;



    //queryJson.offset = offset;

    //Order parsing :
    queryJson.order = ["id"];

    //Result :
    console.log(queryJson);
    return queryJson;

}

function getQueryJson(param, maxResults) {
    var json = JSON.parse(param);

    try {
        queryJson = parseJSON(json, maxResults);
        return queryJson;
    } catch (e) {
        console.log("Erreur, message : " + e);
        return e;
    }
}

function getLibAttributes(jsonLibInsee) {
    
    try {
        libAttributes = jsonLibInsee;
        return libAttributes;
    } catch (e) {
        console.log("Erreur, message : " + e);
        return e;
    }
}

exports.getQueryJson = getQueryJson;
exports.getLibAttributes = getLibAttributes;
