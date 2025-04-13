/*
This is to upload a file. Whenever a file is recieved, we use the follwing steps ;-
1. Taking the file from the user ans dtoring it temporarily in the local storage
2. Moving the file from local storage to cloudinary (through local file path). Then we delete the file from local storage.

NOTE: File is uploaded using multer

here we are dealing with transfer of file from local storage to cloudinary
*/

import dotenv from 'dotenv';
dotenv.config({ path: './env' });

import { v2 as cloudinary} from "cloudinary";
import fs from "fs"  //file system: helps in read, write and move and remove of file

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

/*
console.log("cloud_name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("api_key:", process.env.CLOUDINARY_API_KEY);
console.log("api_secret:", process.env.CLOUDINARY_API_SECRET);
*/

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath)
        {
            //console.log("localFilePath not available in cloudinary");
            return null;
        }

        //uploading the file on cloudinary
        const response = await cloudinary.uploader.upload(
            localFilePath, {
                resource_type: "auto"  //video, file, image, audio, etc any type of file can be uploaded
            }
        )

        console.log("File is uploaded on cloudinary ", response.url) // response holds multiple things related to the file but we only want to print url of the file
        fs.unlinkSync(localFilePath) // // removing the temporary file locally saved in server as operation is done
        return response;
    } catch (error){
        fs.unlinkSync(localFilePath) // removing the temporary file locally saved in server as operation failed
        return null;
    }
}

export { uploadOnCloudinary }