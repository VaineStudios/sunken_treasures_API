const { JSONResponse } = require("../../utilities/response.utility");

const router = require("express").Router();


router.use("/authenticate", require("./routes/auth.routes"));
router.use("/users", require("./routes/user.routes"));
router.use("/product_images", require("./routes/productIMG.routes"));
router.all("/",(req, res, next)=>{
    JSONResponse.success(res, "API Endpoint working Successfully", {
        routes:{
            users: "/api/v1/users",
            productIMG: "/api/v1/product_images",
            authenticate: "/api/v1/authenticate"
        }
    });
    next();
})
module.exports = router;