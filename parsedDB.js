const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

// get data information
const pathToDist = "./data/dist";

const curr_db = "medhashree"; // database in use

async function writeToDB(parsed_agency) {
    const connection = await mysql.createConnection({
        host: "127.0.0.1",
        port:3308,
        user: "root",
        password: "tencosql",
        database: curr_db
    }); // connect to mysql cityscale database

    // NOTE: console.log, can delete or comment
    console.log(`connected to tenco's ${curr_db}`); // confirm connection to database
    console.log(`call from main.js ${parsed_agency}`); // confirm var is passed from main.js

    // gets the names of agencies (folder names within dist)
    // re
    const agencies = fs.readdirSync(pathToDist,{withFileTypes: true})
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);

    // NOTE: console.log, can delete or comment out
    console.log(`AGENCIES ${agencies}`); // confirm what .filter and .map return --> "sacrt,septa"

    // if the parsed_agency exists in pathToDist folder 
        // (will be true since writeToDB is called after parsing logic)
        // go into the agency folder path (pathToDist/${parsed_agency})
        // if this parsed_agency exists already in the database:
            // ask user "this agency exists in the database already. 
            // do you want to overwrite the data? y or n"
            // if y: delete existing, write new
            // if n: end the run "user cancelled the program"
        // else - it doesn't exist
            // write json files


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


// +++++\

    // for(const agency_name of agencies) {
    //     const agencyInfo = path.join(pathToDist, agency_name);
    //     const filenames = fs.readdirSync(agencyInfo);
        
    //     // NOTE: console.log, can delete or comment out
    // console.log(`AGENCIES ${agencies}`);
    //     console.log(`filenames ${filenames}`);
    // };

    // NOTE: console.log, can delete or comment out,, was to test is connected to DB
    // const [cols] = await connection.execute("SHOW COLUMNS FROM parsed_gtfs_data");
    // for (const col of cols) {
    //     console.log(col.Field); // NOTE: console.log, can delete or comment out
    // }
