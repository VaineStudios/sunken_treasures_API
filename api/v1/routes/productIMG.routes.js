const router = require('express').Router()
const ProductImageController = require("../controllers/productIMG.controller");
const {uploadToFolder, uploadFileToS3} = require("../../../utilities/s3.utility");


router
    .route("/")
    .get(ProductImageController.getAllProductImages)
    .post(uploadToFolder("ProductImages").fields([{name: "mainIMG", maxCount: 1}, {name: "secondaryIMG", maxCount: 5}]) ,ProductImageController.createProductImages)

router
    .route("/:id")
    .get(ProductImageController.getProductImages)
    .patch(uploadToFolder("ProductImages").fields([{name: "mainIMG", maxCount: 1}, {name: "secondaryIMG", maxCount: 5}]),ProductImageController.updateProductImages)
    .delete(ProductImageController.deleteProductImages)



module.exports = router;