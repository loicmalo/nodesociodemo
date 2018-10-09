var fs = require('fs');

/**
 * Creates the CSV file from the result table.
 *
 * @param {Array} table
 */
function csvCreator(table) {
    let csv = "\ufeff"; //"utf" header for utf8 encoding.
    let arrRow = [];
    let arrNames = [];
    let arrData = [];
    let c = 0;

    // Loop the array of objects
    for (let row in table) {
        arrRow = [];

        c++;
        v = table[row]["dataValues"];

        for (let field in v) {
            value = v[field];


            if (typeof value === "object") { // Handling point case
                if (value !== null) {
                    //value = "[" + value["coordinates"] + "]";
                    //value = JSON.stringify(value);
                    value = "test";
                } else {
                    value = "";
                }
            }

            if (c === 1) {
                arrNames.push(field);
            }

            arrRow.push(value);
        }
        arrData.push(arrRow);
    }

    for (let i = 0; i < arrNames.length; i++) {
        csv += '"' + arrNames[i] + '"' + ";";
    }

    csv = csv.substr(0, csv.length - 1); //DROPPING LAST ";".
    csv += "\r\n";

    for (let i = 0; i < arrData.length; i++) {
        for (let j = 0; j < arrData[i].length; j++) {
            csv += '"' + arrData[i][j] + '"' + ";";
        }
        csv = csv.substr(0, csv.length - 1); //DROPPING LAST ";".
        csv += "\r\n";
    }

    let date = new Date();
    let now = date.toLocaleTimeString().replace(/:/g, "-");
    console.log(now);
    let path = "file-" + now + ".csv";

    fs.writeFile(path, csv, err => {
        if (err)
            throw err;
        console.log("file saved");
    });

}

/**
 * Creates the CSV file from the result table.
 *
 * @param {Array} table
 * @param {String} path
 * @param {Bool} creation
 *    indicates if file is being created or if values are added.
 
 */
function csvFileDownload(table, path, creation, columnNames) { //Loïc

    let csv = "\ufeff"; //"utf" header for utf8 encoding.
    let arrNames = [];
    let arrRow = [];
    let arrData = [];
    let c = 0;
    let f = 0;

    // Loop the array of objects

    for (let row in table.sociodemo) {
        arrRow = [];

        c++;
        v = table.sociodemo[row];//["dataValues"];

        for (let field in v) {
            f++;
            value = v[field];

            if (c === 1 && creation && f < Object.keys(v).length) {
                arrNames.push(field);
            }

            // Loïc jsonb column names 
            if (c === 1 && creation && f === Object.keys(v).length) {
                if (typeof value === "object") {

                    //console.log(parsedColumnNames);
                    for (let key in value) {
                        arrNames.push(renameColumn(key, columnNames));
                    }

                }
                //console.log("2");
                //console.log(parsedColumnNames);

            }
            arrRow.push(value);
        }
        arrData.push(arrRow);
    }

    if (creation) {
        for (let i = 0; i < arrNames.length; i++) {
            csv += '"' + arrNames[i] + '"' + ";";
        }
        csv = csv.substr(0, csv.length - 1); //DROPPING LAST ";".
        csv += "\r\n";
    }

    for (let i = 0; i < arrData.length; i++) {
        for (let j = 0; j < arrData[i].length; j++) {

            if (typeof arrData[i][j] === "object") {
                if (arrData[i][j] !== null) {
                    csv += objectConvertToCsv(arrData[i][j]);
                } else {
                    csv += "";
                }
            } else {
                csv += '"' + arrData[i][j] + '"' + ";";

            }
        }
        csv = csv.substr(0, csv.length - 1); //DROPPING LAST ";".
        csv += "\r\n";
    }

    fs.appendFile(path, csv, err => {
        if (err)
            throw err;
        if (creation) {
            console.log("file saved as : " + path);
        } else {
            console.log("data appent to file " + path);
        }
    });
}

function jsonFileCreator(json, path = '') {

    fs.writeFile(path + 'file.json', json, err => {
        if (err)
            throw err;
        console.log("file saved");
    });

    return json;
}

function jsonCreator(table) {

    let json = [];

    for (let row in table) {

        vRow = table[row]["dataValues"]; //Value of row - Object
        //console.log(vRow);
        //This part appears blury
        /*
         if (typeof vRow === "object") { // Handling point case
         if (vRow !== null) {
         vRow = "[" + value["coordinates"] + "]";
         }
         else {
         vRow = "";
         }
         }
         */

        json.push(vRow);
    }

    JSONstr = JSON.stringify(json);
    return JSONstr;
}


/**
 * Delete file after download
 * 
 * @param {type} file
 * @returns {undefined}
 */
function deleteFile(file) {
    fs.unlink(file, function (err) {
        if (err) {
            console.error(err.toString());
        } else {
            console.warn(file + ' deleted');
        }
    });
}
/**
 * 
 * @param {type} object
 * @returns {objectConvertToCsv.csv|String}
 * Loïc
 */
function objectConvertToCsv(object) {
    let csv = "";
    for (let property in object) {
        if (object[property] !== null) {
            csv += '"' + object[property] + '"' + ';';
        } else {
            csv += '""' + ';';
        }
    }
    return csv;
}

/**
 * 
 * @param {type} column
 * @param {type} columnNames
 * @returns {Array.dataValues|Array.sociodemo|nm$_file-manager.v}
 */
function renameColumn(column, columnNames) {

    for (let row in columnNames) {
        if (column.toUpperCase() === columnNames[row].id_indic.toUpperCase()) {
            //console.log(columnNames[row].var_lib);
            return columnNames[row].lib_indic;
        }
    }
    return column;

}
exports.csvCreator = csvCreator;
exports.csvFileDownload = csvFileDownload;
exports.jsonCreator = jsonCreator;
exports.jsonFileCreator = jsonFileCreator;
exports.deleteFile = deleteFile;