const {model, Schema} =  require("mongoose");

const productSchema = new Schema({
    name : {type: String, required: [true, "Name of the product is required"]},
    discount: {type: Number},
    price: {type: Number, required:[true, "Price of product is required"]},
    condition: {type: String, enum:{values: ["New", "Mint", "Used"], message: "Condition must be 'New','Mint' or 'Used'}"}},
    description: {type: String},
    prod_img: {type: Schema.Types.ObjectId, ref: "ProductIMG"},
    seller: {type: Schema.Types.ObjectId, ref:"User"},
    inventory: {type: Number, default: 1},
    rating: {type: Number, default: 5},
    productImages: {type: Schema.Types.ObjectId, ref:"ProductIMG"},    
    additional_details: {type: String},
    category: {type:Schema.Types.ObjectId, ref: "Category"},
    reviews: {type: Schema.Types.ObjectId, ref: "Reviews"},

},{timestamps: true});