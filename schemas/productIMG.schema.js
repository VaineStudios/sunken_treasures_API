const {model, Schema} =  require("mongoose");

const productIMG = Schema({
    mainIMG: {type: String, required: [true,"A main Image must be provided"]}, 
    secondaryIMG: {type: Schema.Types.Array.options.castNonArrays, default: []}
    
});


module.exports = model("ProductIMG", productIMG);