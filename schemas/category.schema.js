const {model, Schema} = require("mongoose");

const categorySchema = new Schema({
    name: {type: String, required: [true, "Category name must be provided"]},
    sub_category: {type: Schema.Types.ObjectId, ref: "Category"}
});




module.exports = model("Category", categorySchema);