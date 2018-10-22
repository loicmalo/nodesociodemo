var fs = require('fs');
var archiver = require('archiver');
var repo = require('../repositories/sociodemoRepository');
var libRepo = require('../repositories/libInseeRepository');

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

    let arrRow = [];

    let c = 0;

    let csv = "";
    let subTheme = "";
    let subThemes = new Object();
    let subThemesColumnNames = new Object();

    // Loop the array of objects

    for (let row in table.sociodemo) {
        arrRow = [];
        let f = 0;
        creation = false;
        c++;
        v = table.sociodemo[row];//["dataValues"];

        if (!(v["sous_themes"] in subThemes)) {

            creation = true;
            subTheme = v["sous_themes"];

            subThemes[subTheme] = [];
            subThemesColumnNames[subTheme] = [];
        }

        for (let field in v) {
            f++;
            value = v[field];

            if (creation && f < Object.keys(v).length) {

                subThemesColumnNames[subTheme].push(field);
            }
            // Loïc jsonb column names 
            if (creation && f === Object.keys(v).length) {
                if (typeof value === "object") {


                    for (let key in value) {

                        subThemesColumnNames[subTheme].push(renameColumn(key, columnNames));
                    }
                }
            }
            arrRow.push(value);
        }
        subThemes[subTheme].push(arrRow);
    }

    var output = fs.createWriteStream('./public/example.zip');
    var archive = archiver('zip', {
        zlib: {level: 9}
    });

    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    output.on('end', function () {
        console.log('Data has been drained');
    });

    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {

        } else {

            throw err;
        }
    });

    archive.on('error', function (err) {
        throw err;
    });

    archive.pipe(output);

    for (let subTheme in subThemes) {
        let csv = "\ufeff"; //"utf" header for utf8 encoding.

        path = './public/' + subTheme + '.csv';
        if (fs.existsSync(path)) {
        } else {
            csv += arrNamesConvertToCsv(subThemesColumnNames[subTheme]);

        }
        csv += arrDataConvertToCsv(subThemes[subTheme]);
        //console.log(subThemes[subTheme]);


        fs.appendFile(path, csv, err => {
            if (err) {
                throw err;
            } else {
                //archive.append(fs.createReadStream(path));

            }
        });


    }
    archive.finalize();
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

function arrNamesConvertToCsv(arrNames) {
    let csv = "";

    for (let i = 0; i < arrNames.length; i++) {
        csv += '"' + arrNames[i] + '"' + ";";
    }
    csv = csv.substr(0, csv.length - 1); //DROPPING LAST ";".
    csv += "\r\n";
    return csv;
}

function arrDataConvertToCsv(arrData) {
    let csv = "";
    //console.log(arrData);
    for (let i = 0; i < arrData.length; i++) {
        //console.log(arrData[i].length);
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

async function generateParamsCreationFile(queryJson, libAttributes) {

    // resolves concurrent creationFile queries : result and columnNames
    const tableParams = await Promise.all([repo.queryWithParam(queryJson), libRepo.columnNamesQuery(libAttributes)]);

    return tableParams;
}

exports.csvCreator = csvCreator;
exports.csvFileDownload = csvFileDownload;
exports.jsonCreator = jsonCreator;
exports.generateParamsCreationFile = generateParamsCreationFile;
exports.jsonFileCreator = jsonFileCreator;
exports.deleteFile = deleteFile;