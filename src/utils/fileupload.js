//cloudinary 

import {v2 as cloudinary} from 'cloudinary'

import fs from 'fs'  // used to read and write the files

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});

const uploadOnCloudinary = async(localfilePath)=>{
    try {
        if(!localfilePath) return null
        //upload file on clodinary
        const response= await cloudinary.uploader.upload(localfilePath,{
            resource_type:"auto",
        })

        //file has been uplaod success
        console.log("File Uploaded on cloudinary",response.url);
        fs.unlinkSync(localfilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localfilePath) ///remove the locally saved file as the upload operation got failed        

        return null
    }
}

export {uploadOnCloudinary}