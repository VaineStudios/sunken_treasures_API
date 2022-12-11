require("dotenv").config();
const jwt = require("jsonwebtoken");


class JWTHelper{
    /**
     * ### Description
     * Generates a JWT token with the data passed in as the payload.
     * @param {Object} data data to use as the payload of the token
     * @param {string} expiryDate string representation of time, in seconds
     * */ 

    static genToken = (data, expiryDate)=>{
        let expireIn = expiryDate + "s"
        return jwt.sign(data,process.env.JWT_SECRET_KEY, {expiresIn: expireIn})
    }
    static setToken(req, res, payload, name, expire = '3600s') {
		const token = this.genToken(payload, expire);
		res.cookie(name, token, {
			expiresIn: expire,
			httpOnly: true,
			secure: (process.env.NODE_ENV === 'production'), // sets secure to true if the NODE_ENV variable is present
			signed: (process.env.NODE_ENV === 'production'),
			sameSite: 'none'
		})
	}
	static getToken(req, res, name) {
		let decoded
		try {
			decoded = jwt.verify(req.signedCookies[name], JWT_SECRET_KEY);
		} catch (err) {
			this.killToken(req, res, name)
			console.error(err)
			decoded = null
		}
		return decoded
	}
	static killToken(req, res, name) {
		res.cookie(name, null, {
			expiresIn: 0,
			httpOnly: true,
			secure: (process.env.NODE_ENV === 'production'),
			signed: true,
			sameSite: 'none',
		})
	}





}


module.exports = JWTHelper;