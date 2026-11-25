const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const pathToDist = "./data/dist";

const CURR_DB = "medhashree"; // database in use

// FUNCTION: writes the JSON files for "parsed_agency" in the mysql database
// INPUTS:
//    connection: the connection to mysql database
//    agencies: agencies that have parsed data and exist in dist file 
//    parsed_agency: the agency in progress of being parsed and written to the database
async function writeJSONtoDB(connection, curr_agency) {
    const agency_folder = path.join(pathToDist, curr_agency);

    const agency = JSON.parse(fs.readFileSync(path.join(agency_folder, "agency.json"), "utf8"));
    const routes = JSON.parse(fs.readFileSync(path.join(agency_folder, "routes.json"), "utf8"));
    const routesWithShapeIds = JSON.parse(fs.readFileSync(path.join(agency_folder, "routesWithShapeIds.json"), "utf8"));
    const routesWithStops = JSON.parse(fs.readFileSync(path.join(agency_folder, "routesWithStops.json"), "utf8"));
    const shapes = JSON.parse(fs.readFileSync(path.join(agency_folder, "shapes.json"), "utf8"));

    const [result] = await connection.execute(
        `INSERT INTO parsed_gtfs_data
        (agency_id, agency, routes, routesWithShapeIds, routesWithStops, shapes)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            curr_agency,
            JSON.stringify(agency),
            JSON.stringify(routes),
            JSON.stringify(routesWithShapeIds),
            JSON.stringify(routesWithStops),
            JSON.stringify(shapes)
        ]
    );
    console.log(`writeJSONtoDB accessed and var ${curr_agency} accessed`);
}

// FUNCTION: places the output json files into the correct fields
// INPUTS:
//    parsed_agency: the agency in progress of being parsed and written to the database
async function writeToDB(curr_agency) {
    const connection = await mysql.createConnection({
        host: "127.0.0.1",
        port: 3308,
        user: "root",
        password: "tencosql",
        database: CURR_DB,
        jsonStrings: false
    }); // connect to mysql cityscale database

    // NOTE: console.log, can delete or comment
    if(!connection){
        console.log(`NOT connected to tenco's ${CURR_DB}`);
        return;
    }
    console.log(`connected to tenco's ${CURR_DB}`); // confirm connection to database

    // gets the names of agencies (folder names within dist)
    const dist_agencies = fs.readdirSync(pathToDist,{withFileTypes: true})
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);

    // NOTE: console.log, can delete or comment out
    console.log(`AGENCIES ${dist_agencies}`); // confirm what .filter and .map return --> "sacrt,septa"
     
    if(dist_agencies.includes(curr_agency)) {
        // console.log(`parsed_agency '${parsed_agency}' in agencies '${agencies}'`);
        // go into the agency folder path (pathToDist/${parsed_agency})
        const [rows] = await connection.execute(
            "SELECT agency_id from parsed_gtfs_data"
        );

        const db_agency_ids = rows.map(row => row.agency_id); // get all agencies in db

        // NOTE: console.log, can delete or comment out
        console.log(db_agency_ids); // confirm correct column is being accessed

        // if this parsed_agency exists already in the database:
        if(db_agency_ids.includes(curr_agency)) {
            console.log(`parsed_agency '${curr_agency}' in database '${CURR_DB}'`);
            const [rows] = await connection.execute(
                `SELECT * FROM parsed_gtfs_data WHERE agency_id = ?`,
                [curr_agency]
            );

            const a = rows[0].agency_id;
            console.log(`this is agency json: ${a}`);
            console.log(`this is a fields ${rows[0].agency[0].agency_name}`);
            // TODO implement:
            // ask user "this agency exists in the database already. 
            // do you want to overwrite the data? y or n"
            // if y: overwrite (delete then call writeJSONtoDB?)
            // if n: "user cancelled the program" and return

        } else {
            console.log(`parsed_agency '${curr_agency}' not in database '${CURR_DB}/parsed_gtfs_data'`);
            await writeJSONtoDB(connection, curr_agency);
        } // transit doesn't doesn't exist in db

    } else {
        // TODO: case not really possible... this if else could be deleted
        return;
    } // if the parsed_agency exists in agencies

    await connection.end(); // end connection to db
}

module.exports = {
    writeToDB
};