require("dotenv").config();
const AWS = require("aws-sdk");
const fs = require("fs");
const multer = require("multer");
const multerS3 = require("multer-s3");
const {AMZ_BUCKET_NAME, AMZ_ACCESS_KEY, AMZ_SECRET_KEY, AMZ_BUCKET_REGION} = process.env;

/**
 *  Description
 * Helps to create and manage a s3 bucket instance.
 */

class AWSStorage{

    ACCEPTED_FILE_TYPE = [
        "image/png",
        "image/jpg",
        "image/jpeg",
        "image/webp",
    ];

    s3 = {}    
    uploadFileToS3 = {};
    
    /**
     * ### description
     * Uses the keys passed in as a parameter to the constructor to set up a secure storage in AWS S3 bucket
     * @param {string} accessKeyId 
     * @param {string} secretAccessKey 
     * @param {string} bucketName 
     * @param {string} region 
     */
    constructor(accessKeyId = AMZ_ACCESS_KEY, secretAccessKey=AMZ_SECRET_KEY, bucketName = AMZ_BUCKET_NAME, region = AMZ_BUCKET_REGION){


        this._bucketName = bucketName;
        this._region = region;
        this._accessKeyId = accessKeyId;
        this._secretAccessKey = secretAccessKey;
        this.setUpAWS();
        this.setUpMulter();
    }


    setUpAWS = ()=>{
        this.s3 = new AWS.S3({
            accessKeyId:this._accessKeyId,
            secretAccessKey:this._secretAccessKey
        });
    };
    
    setUpMulter = ()=>{
        this.uploadFileToS3 = multer({
        
            storage: multerS3({
                s3:this.s3,
                bucket:this._bucketName,
                metadata: (req, file, cb)=>{
                    cb(null, {fieldName: file.fieldname})
                },
                key:(req, file, cb)=>{
                    cb(null, Date.now().toString() + '-' + file.originalname);
                }
        
            })
        })
    }

    fileFilter = (req, file, cb) => {
        if (this.ACCEPTED_FILE_TYPE.includes(file.mimeType)) {
            cb(null, true)
        } else {
            cb(null, false);
            return cb(new Error("File type is not supported"))

        }
    }
    uploadToFolder = (foldername)=>{
        return multer({
            // fileFilter: this.fileFilter,
            storage: multerS3({
                s3:this.s3,
                bucket:this._bucketName,
                
                metadata:(req, file, cb)=>{
                    
                    cb(null, {fieldName:file.fieldname})
                }, 
                
                key:(req, file, cb)=>{
                    cb(null, foldername+"/"+Date.now().toString()+"-"+file.originalname);
                }
            })
        })
    }


    /**
     * ### Description
     * Uses the location passed in as a parameter to search for and delete an object from the remote storage location in the S3 bucket.
     * 
     * @param {string} location This is the address or uri of the object to be deleted. 
     * @returns Promise
     */
    deleteObjectFromS3 = async (location)=>{
        if(!location) return Promise.reject(new Error("No location was specified"))
        let objectName = location.split("/").slice(-2).join("/");
        // location will be a enconded url so we decode it since we the key isn't encoded.
        objectName = decodeURIComponent(objectName)

        const params = {
            Bucket : this._bucketName,
            Key: objectName,
        }
        try{
            // checks to see if there is any errors with the file metadata.
            await this.s3.headObject(params).promise();

            await this.s3.deleteObject(params).promise();
            return Promise.resolve("Object successfully deleted");

        }catch(error){
            return Promise.reject(new Error("File not found Error : " + error));
        }
    }
}


module.exports = new AWSStorage();


