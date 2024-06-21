import {v2 as cloudinary} from "cloudinary";
import fs from "fs";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) return "Cloud not find the path to thr file";
       const response = await cloudinary.uploader.upload(filepath, {
            resource_type: "auto"
        })
        console.log("File is successfully uploaded on cloudinary ", response.url);
        return response;

    } catch (error) {
        fs.unlinkSync(filePath);
        return null;
    }
}


export {uploadOnCloudinary} 