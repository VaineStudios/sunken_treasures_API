const { JSONResponse } = require("../../utilities/response.utility");

const router = require("express").Router();


router.use("/authenticate", require("./routes/auth.routes"));
router.use("/users", require("./routes/user.routes"));
router.all("/",(req, res, next)=>{
    JSONResponse.success(res, "API Endpoint working Successfully", {
        routes:{
            users: "/api/v1/users",
            authenticate: "/api/v1/authenticate"
        }
    });
    next();
})
module.exports = router;