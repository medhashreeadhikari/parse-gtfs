const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

// get data information
const pathToDist = "./data/dist";

const curr_db = "medhashree"; // database in use

async function writeToDB(parsing_agency) {
    const connection = await mysql.createConnection({
        host: "127.0.0.1",
        port:3308,
        user: "root",
        password: "tencosql",
        database: curr_db
    }); // connect to mysql cityscale database

    // NOTE: console.log, can delete or comment out
    console.log(`connected to tenco's ${curr_db}`);

    // get the folder names inside dist
    const agencies = fs.readdirSync(pathToDist,{withFileTypes: true})
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);

    for(const agency_name of agencies) {
        const agencyInfo = path.join(pathToDist, agency_name);
        const filenames = fs.readdirSync(agencyInfo);
        
        // NOTE: console.log, can delete or comment out
        console.log(`agency ${agency_name}`);
        console.log(`filenames ${filenames}`);
    };

    const [cols] = await connection.execute("SHOW COLUMNS FROM parsed_gtfs_data");
    for (const col of cols) {
        console.log(col.Field); // NOTE: console.log, can delete or comment out
    }

    // take files from dist files, and place in DB:
    // 1. access agencies dist files: pathToDist/agency
    console.log(`call from main.js ${parsing_agency}`);

    // 2. read the json file
    // 3. dump the json files in the correct rows
} // function to put the output json files into the correct schema and table

module.exports = {
    writeToDB
};
// writeToDB();

// TODO: delete text    below 
// take the json files previously created, and put into table
// ### 1 table with: 
//     # 5 columns which are the fields
//         # agencies
//         # routes
//         # routesWithShapeIds
//         # routesWithStops
//         # shapes
//     # rows are one agencies information
//     # each field is in a json format 
// ###

// // confirm access correct schema by printing headers
// console.log(`connected to tenco's ${curr_db}`);

// const [rows, fields] = await connection.execute(
//     "SELECT * FROM parsed_gtfs_data"
// );

// const headers = fields.map(field => field.name);

// console.log(headers);
// console.log(rows);

// await connection.end();
