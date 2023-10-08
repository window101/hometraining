const express = require("express");
const fs = require("fs");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
//const {accessToken, makeLogin, accessToken, refreshToken, loginSuccess, logout} = require("./controllers");

const app = express();
dotenv.config();

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended : false}));

app.use(express.json());
app.use(express.urlencoded({ extended : false}));
app.use(cors());
app.use(cookieParser());

const port = 4000;
app.listen(port, () => {
    console.log("Server listening on port", port);
    // console.log(process.env.DB_HOST); RDS 일시중지라 오류
})

app.use('/user', require('./routes/userRouter'));
