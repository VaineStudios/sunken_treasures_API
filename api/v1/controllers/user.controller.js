const User = require("../../../schemas/user.schema");
const { JSONResponse } = require("../../../utilities/response.utility");
const { ObjectId } = require("mongoose").Types;

class UserController {
   /**
    *
    * ### Description
    * Gets all the user profiles in the database
    * @param {Request} req
    * @param {Response} res
    * @param {Next} next
    */
   static getAllUsers = async (req, res, next) => {
      try {
         let users = await User.find();

         JSONResponse.success(res,"Retrieved all users successfully",users,201);
      } catch (error) {
         JSONResponse.error(res, "Error Retrieving user profiles", error, 404);
      }
   };

        /**
     * 
     * ### Description
     * Creates a user profile with the data that the user passes in the body.
     * @param {Request} req 
     * @param {Response} res 
     * @param {Next} next 
     */
    static createUserProfile = async(req, res, next)=>{
        try{
            let data = req.body;
            if(Object.keys(data).length == 0) throw new Error("No data passed to create user profile");
            data.image = (req.file) ? req.file.location : undefined;
            let user = await new User(data)
            let duplicate = await user.checkDupe();
            if(duplicate) throw new Error("Duplicate Entry already found with this data");
            await user.save();
            JSONResponse.success(res, "User profile successfully created", user, 201);
        }catch(error){
            JSONResponse.error(res, "Error creating user profile", error, 400);
        }
    }

        /**
     * 
     * ### Description
     * Gets the user profile for a single user with the id that is passed in as a parameter, then updates the user with the data that is passed in the body.
     * @param {Request} req 
     * @param {Response} res 
     * @param {Next} next 
     */
    static updateUserProfile = async(req, res, next)=>{
        try{
            let data = req.body;
            let id = req.params.id;
            // not letting user update password at this route;
            if(data.password) data.password = undefined;
            data.image = (req.file) ? req.file.location : undefined;
            if(!ObjectId.isValid(id)) throw new Error("Invalid ID was passed as a parameter");
            if(Object.keys(data).length == 0) {
                return JSONResponse.success(res, "No data passed, file not updated",{}, 200);
            }
            let user = await User.findOneAndUpdate({_id:id},data, {new:true});
            if(!user) throw new Error("User not found with the ID");
            JSONResponse.success(res, "User updated successfully", user, 200);
        }catch(error){
            JSONResponse.error(res, "Unable to update user profile", error, 404);
        }
    }

   /**
    *
    * ### Description
    * Gets the user profile for a single user with the id that is passed in as a parameter and deletes it, returning the user that was deleted.
    * @param {Request} req
    * @param {Response} res
    * @param {Next} next
    */
   static deleteUserProfile = async (req, res, next) => {
      try {
         let id = req.params.id;
         if (!ObjectId.isValid(id))
            throw new Error("ID does not match any user profile in database");
         let user = await User.findByIdAndDelete(id);
         if (!user) throw new Error("User does not exist with this ID");
         JSONResponse.success(res, "Successfully deleted user", user, 203);
      } catch (error) {
         JSONResponse.error(res, "Unable to delete user", error, 404);
      }
   };

   /**
    *
    * ### Description
    * Gets the user profile for a single user with the id that is passed in as a parameter.
    * @param {Request} req
    * @param {Response} res
    * @param {Next} next
    */
   static getUserProfile = async (req, res, next) => {
      try {
         let id = req.params.id;
         if (!ObjectId.isValid(id))
            throw new Error("Id is not a valid user profile in database");
         let user = await User.findById(id);
         if (!user) throw new Error("User not found with this id");
         user.password = undefined;
         JSONResponse.success(res, "Retrieved user info", user, 200);
      } catch (error) {
         JSONResponse.error(res, "Unable to find user", error, 404);
      }
   };

   static requestPasswordReset = async (req, res, next) => {
        try{
            let {email, redirectLink} = req.body;
            let users = await User.find({email: email});
            if(users.length === 0) throw new Error("No user exists with that email");
            let user = users[0];
            await user.requestPasswordReset(redirectLink);
            JSONResponse.success(res, "Successfully sent password reset request", {},200);
        }catch(error){
            JSONResponse.error(res, "Unable to reset password", error,404)
        }
   }
   static resetPassword = async(req, res, next)=>{
     try{
        let {password, email} = req.body;
        // Ensures that only the password will be updated on this route.
        let data = {password};
        console.log(data)
         let user = await User.findOneAndUpdate({email: email},data,{new: true} );
         if (!user) throw new Error("User not found with this id");
         user.password = undefined;
         JSONResponse.success(res, "Retrieved user info", user, 200);
      } catch (error) {
         JSONResponse.error(res, "Unable to find user", error, 404);
      }
     
   }

}

module.exports = UserController;
