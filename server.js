require("dotenv").config();
const express = require('express');
const server = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 4000;
const connectDatabase = require("./connections/db");
const API_V1 = require("./api/v1/api.routes");
const { JSONResponse } = require("./utilities/response.utility");
const {WHITELIST} = process.env;
const whiteList = JSON.parse(WHITELIST);
const CORS_OPTION = {
    origin : function (origin, callback) {
        if((whiteList.indexOf(origin) !== -1) || whiteList.indexOf("*") !== -1){
            callback(null, true);
        }else{
            callback(new Error("Cors Disabled access to this endpoint")); 
        }
    },
    optionsSuccessStatus: 200
}

server.use(cookieParser()); // uses cookie to store tokens
server.use(express.json()); //allow us to read the request body
server.use(express.urlencoded({extended:true})); /// allow for query strings to be encoded with library tthat parses nested objects.
server.use(cors(CORS_OPTION)); //setting cors with option;
connectDatabase();


// Routers
server.use("/api/v1", API_V1);

// 
server.all("/",(req, res)=>{
    JSONResponse.success(res, "API is currently Running", {API: "/api/v1"})
})
server.all("/:route",(req, res)=>{
    return res.redirect("/");
})








server.listen(PORT, ()=>{
    console.log("listening on port ",PORT );
});