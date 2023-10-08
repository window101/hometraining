
const fs = require("fs");

//const data = fs.readFileSync("./database.json");
//const conf = JSON.parse(data);
const mysql = require("mysql");

const dotenv = require("dotenv");
dotenv.config();
const connection = mysql.createConnection({
    //host : conf.host,
    //user : conf.user,
    //password : conf.password,
    //port : conf.port,
    //database : conf.database,
    
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    port : process.env.DB_PORT,
    database : process.env.DB_DATABASE,
});


connection.connect();

module.exports = connection;
