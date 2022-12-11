const mongoose = require('mongoose');
const {DB_URI} = process.env;


const MONGOOSE_OPTIONS = {
    bufferCommands: false, // prevents use of models if not connected


}

async function connectDatabase(){
    try{
        await mongoose.connect(DB_URI, MONGOOSE_OPTIONS);
        console.log("Database was connected successfully")
    }catch(error){
        console.log("There was an error connecting to the mongoose DB: ", error.message)
    }

}

// if the server somehow disconnects then it will fire the function callback;
mongoose.connection.on("disconnected", ()=>{
    console.log("Mongoose database was disconnected");
})


module.exports = connectDatabase;