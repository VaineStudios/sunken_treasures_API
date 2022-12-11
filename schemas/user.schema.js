const {model, Schema} = require("mongoose");
const bcrypt = require("bcryptjs");
const emailer = require("../utilities/nodemailer.utility");
const htmlCompiler = require("../utilities/compileHtml.utility");

const userSchema = new Schema({
    first_name : {
        type: String, 
        required:[true,"First name is a required field"]
    }, 
    last_name : {
        type: String, 
        required: [true, "Last name is a required field"]
    }, 
    image: {
        type: String
    },
    email: {
        type: String, 
        unique: true,
        required:[true, "Email is a required field"]
    },

    password: {
        type: String, 
        required: [true, "Password was not provided"]
    },
    phone: {type: String, required: [true, "Phone number was not provided"]},
    isSuperAdmin:{
        type: Boolean,
        default: false,
    }
   

});


// Middleware function to execute and hash password before saving user into the database.

userSchema.pre("save", async function(next){
    try{
        if(!this.isModified('password')) return next(); 
        this.password = await bcrypt.hash(this.password,10);       
        this.isSuperAdmin = false;
    }catch(error){
        return Promise.reject(new Error(error.message));
    }
    
});


userSchema.post("save", async function(doc){
    doc = removeSensitiveFields(doc);
});

userSchema.pre("findOneAndUpdate", async function(next){    
    try{
        if(this._update.password) {
            this._update.password = await bcrypt.hash(this._update.password, 10)
        }
    }catch(error){
        return Promise.reject(new Error(error.message));
    }
});

userSchema.methods.checkDupe = function () {
	return new Promise(async (resolve, reject) => {
		const dupe = await model('User')
			.find({ email: this.email})
			.catch((err) => {
				reject(err)
			})
		resolve(dupe.length > 0)
	})
}

userSchema.post(/^find/, async function(doc){
    if(Array.isArray(doc)){
        for(let file of doc){
            file = removeSensitiveFields(file);
        }
    }else {
        if(!doc) return Promise.reject(new Error("No File found"));

        // checks to see if the operation is findOne and if there is an email in the conditions
        if(!(this.op == "findOne" && this._conditions.email)) {
            doc = removeSensitiveFields(doc);

        }
    }
});


function removeSensitiveFields(doc){
    doc.isSuperAdmin = undefined;
    doc.password = undefined;   
    return doc
}
// Instance method to check for a password to compare a password with the encrypted password on the instance document.
userSchema.methods.isCorrectPassword = async function(password){
    let isCorrect = await bcrypt.compare(password, this.password);
    return isCorrect;
}


userSchema.methods.requestPasswordReset = async function(redirectLink){
    console.log(this);
    const data = {
        user: {first_name: this.first_name, last_name: this.last_name},
        redirectLink
    }
    try{
        let html = htmlCompiler.compileHtml("password_reset",data);
        await emailer.sendMail(this.email, "Password Reset",`Hello ${this.first_name} ${this.firstname}`,html);
    }catch(error){
        return Promise.reject(new Error(error));
    }
}


module.exports = model("User", userSchema);