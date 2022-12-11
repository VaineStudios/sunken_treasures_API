const { JSONResponse } = require("../../../utilities/response.utility");
const JWT = require("jsonwebtoken");

class Middleware{

    /**
     * ### Description
     * Gets the requests then checks to ensure therer is a authorization header present. If there is it gets the token and assigns it to the request as a token property.
     * @param {Request} req 
     * @param {Response} res 
     * @param {*} next 
     */
    static isAuthenticated = async (req, res, next) => {
        try{
            const bearerHeader = req.headers['authorization'];
            
            if (bearerHeader) {
                const bearer = bearerHeader.split(' ');
                const bearerToken = bearer[1];
                req.token = bearerToken;
                let decodedToken = JWT.verify(bearerToken, process.env.JWT_SECRET_KEY);
                req.user = decodedToken;
                next();
            } else {
                // Forbidden
                JSONResponse.error(res, "Unauthorized Access Attempted","Access Denied", 403);        }
        }catch(error){
            JSONResponse.error(res, "Unauthorized Access Attempted",error, 403); 
        }
    }
    static isSuperAdmin = (req, res, next)=>{
        if(req.user.isSuperAdmin){
            next()
        }else{
            JSONResponse.error(res, "Unauthorized Access Attempted", "You do not have the permission to access this data", 403);
        }
    }

    static isUserOrSuperAdmin = (req, res, next)=>{
        if(req.params.id != req.user.id){
            return this.isSuperAdmin(req, res,next);
        }else{
            next();
        }
    }

    
}

module.exports = Middleware;