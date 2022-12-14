const { JSONCookie } = require("cookie-parser");
const { isValidObjectId } = require("mongoose");
const ProductIMG = require("../../../schemas/productIMG.schema");
const {JSONResponse} = require("../../../utilities/response.utility");
const { deleteObjectFromS3 } = require("../../../utilities/s3.utility")


class ProductImageController{

    static getAllProductImages = async(req, res, next)=>{

        try{
            let query = req.query.productID;
            if(query){
                return this.getProductImagesByProductID(req, res, query);
            }else if(Object.keys(req.query) > 0) throw new Error("Not a valid query parameter");
            let productImages = await ProductIMG.find();

            JSONResponse.success(res, "Successfully retrieved product images", productImages, 200);
        }catch(error){
            JSONResponse.error(res, "Unable to retrieve product images", error, 404);
        }
    }
    /**
     * Creates a ProductImage from the data that is passed in from the body.
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    static createProductImages = async(req, res, next)=>{
        try{
            let data = {}
            await this.checkForMainImage(req.files);
            console.log(req.files);
            data.mainIMG = req.files.mainIMG[0].location;
            if(req.files.secondarIMG){
                data.secondaryIMG = req.files.secondaryIMG.map((file)=>file.location);
            }
            
            let productImages = await new ProductIMG(data).save();
            JSONResponse.success(res, "Successfully created product Img",productImages, 200)
        }catch(error){
            JSONResponse.error(res, "Unable to create product Img", error, 400)
        }
    }

    /**
     * This controller method gets a product image from the database that matches the id that is passed to the route.
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    static getProductImages = async(req, res, next)=>{
        try{
            let id = req.params.id;
            if(!isValidObjectId(id)) throw new Error("Not a valid ID for product image");
            let productImages = await ProductIMG.findOne({_id: id});
            if(!productImages) throw new Error("Product image not found");
            JSONResponse.success(res, "Successfully created product",productImages, 200)

        }catch(error){
            JSONResponse.error(res, "Unable to get product images", error,404)
        }
    }

    static deleteProductImages= async (req, res, next) => {
        try{
            let id = req.params.id;
            if(!isValidObjectId(id)) throw new Error("Not a valid ID for product image");
            let productImages = await ProductIMG.findOne({_id:id});
            if(!productImages)throw new Error("Product image not found");
            
            await deleteObjectFromS3(productImages.mainIMG);
            // loops through the array of secondaryIMG then for each we delete the location saved in the array.
            productImages.secondaryIMG.forEach(async(location)=>{
                await deleteObjectFromS3(location);
            });
            await productImages.deleteOne(); // * not sure if this would remove binding of productImages. 

            // test to see if binding was removed            
            JSONResponse.success(res, "Product images deleted successfully", productImages, 200)
        }catch(error){
            JSONResponse.error(res, "Unable to delete product images", error,404)
        }
    }

    static getProductImagesByProductID = async(req, res, query)=>{
       try{
        if(query){
            let productImages = await ProductIMG.findOne({_id: query});
            if(!isValidObjectId(query)) throw new Error("The ID passed is not valid")
            if(!productImages) throw new Error("No Image found for product");
            JSONResponse.success(res, "Product images retrieved successfully", productImages, 200)
        }
        throw new Error("No ID passed to find product images")
       }catch(error){
        JSONResponse.error(res, "Unable to retrieve product images", error, 404);
       }
    }

    static updateProductImages = async (req, res, next) => {
        try{
            let id = req.params.id;
            let data = {}
            let files = req.files;
            if(!isValidObjectId(id)) throw new Error("Not a valid ID for product image");
            let productImages = await ProductIMG.findOne({_id: id});
            if(!productImages) throw new Error("Product images not found");
            // test to see what data is sent from multer if no data is passed.
            if(!productImages.mainIMG) throw new Error("Product does not have a main image");
            
            if(files.mainIMG || files.secondaryIMG){
                if(files.mainIMG){
                    await deleteObjectFromS3(productImages.mainIMG);
                    productImages.mainIMG = files.mainIMG[0].location;
                }
                if(files.secondaryIMG){
                    // TODO
                    // check to see if the files are present in the product images already uploaded. 
                    // let decodedProductImages = productImages.secondaryIMG.map((url)=> {
                    //     let objectName = location.split("/").slice(-2).join("/");
                    //     decodeURIComponent(objectName);
                    //     // remove the timestamp from object name
                    //     objectName = objectName.split("-").slice(1).join();
                    //     console.log(objectName);
                    //     return objectName;
                    // })
                    // files.secondaryIMG.filter((file)=>{

                    //     console.log(file.originalname)
                    //     return !decodedProductImages.includes(file.originalname)
                    // })


                    // remove all product secondaryIMG and save ones submitted 

                    productImages = productImages.secondaryIMG.forEach(async(url)=>{
                        await deleteObjectFromS3(url)
                    });

                    data.secondaryIMG = files.secondaryIMG.map((file)=> file.location);
                }
            }
            productImages = await ProductIMG.findByIdAndUpdate(id, data, {new: true});
            
            JSONResponse.success(res, "Successfully updated product images", productImages, 200);
        }catch(error){
            JSONResponse.error(res, "Unable to update the product images", error, 404)
        }
    }
    
    static checkForMainImage = async (files)=>{
        // if the main image is not provided. check if the secondary image is provided, if it is then loop through and delete them. then through an error
            if(!files.mainIMG) {
                if(files.secondaryIMG){
                    for(let file of files.secondaryIMG){
                        // console.log(file.location)
                        await deleteObjectFromS3(file.location)
                    }
                }
                return Promise.reject(new Error("No Main Image sent"))
            }
        
    }

}


module.exports = ProductImageController