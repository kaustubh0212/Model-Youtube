//import { verify } from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
 
// process to register the user:
// 1) get user details from frontend/postman
// 2) validation: data is not empty and in correct format
// 3) check if user already exists through username and email
// 4) check for Images, check for avatar
// 5) upload them(Image, avatar) to cloudinary
// 6) after uploading on cloudinary, it returns a URL which we need to verify
// 7) Now file is done
// 8) now create a user object from the details recieved. This user object to be uploaded on MongoDB
// 9) create entry in DB
// 10) remove password and refresh Token
// 11) check for user creation
// 12) generate response


// 11) once data is uploaded, a response will return containing the same data which is uploaded. from this we have to remove password and token and send data back to frontend/Postman as response

// registerUser is a function
const registerUser = asyncHandler( async(req, res) => {
    
    // 1) get user details from frontend/postman
    const {fullName, email, username, password} = req.body
    // req.body provides data from frontend
    // req.body:  [Object: null prototype] {
    //     fullName: 'Kaustubh Agrawal',
    //     email: 'kaustubhagrawal02@gmail.com',
    //     username: 'chaiaurcode',
    //     password: '123456790'

    console.log("fullName: ", fullName);
    console.log("email: ", email);
    console.log("username: ", username);
    console.log("password: ", password);
    
    // 2) validation: data is not empty and in correct format
    
    /*
    classsic method to check weather data arrived from frontend/postman or not
    if(fullName === "")
    {
        throw new ApiError(400, "fullName is Empty");
    }
    */

    if([fullName, email, username, password].some((field) => field?.trim() === ""))
    {
        throw new ApiError(400, "All fields are required")
    }

    // 3) check if user already exists through username and email
    /*
    User.findOne({username}) // if same username return error
    User.findOne({email}) // if same email return error
    */

    const existedUser = await User.findOne({// if existed user is there then its schema is already created and hence we can simply search for it using User.findOne() where User is the copy of UserSchema we created
        $or: [{username}, {email}]
    })

    if(existedUser) {
        throw new ApiError(409, "User With email or username already exist")
    }

    /*
    // 4) check for Images, check for avatar using multer
    beginner friendly syntax:

    let avatarLocalPath;
    if (req.files && req.files.avatar && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path;
    } else {
        avatarLocalPath = undefined; // or set a default path if you want
    }
    */
    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // req.files is used to extract data from multer
    console.log("avatarLocalPath: ", avatarLocalPath);
    // avatar has many properties like file type(jpg, png, etc) and other properties. we want the first one so avatar[0].
//     eg. for above:
    
//   req.files:  [Object: null prototype]{
//   coverImage: [
//     {
//       fieldname: 'coverImage',
//       originalname: 'profile photo.jpg',
//       encoding: '7bit',
//       mimetype: 'image/jpeg',
//       destination: './public/temp',
//       filename: 'profile photo.jpg',
//       path: 'public\\temp\\profile photo.jpg',
//       size: 726258
//     }
//   ],
//   avatar: [
//     {
//       fieldname: 'avatar',
//       originalname: 'avatar.jpg',
//       encoding: '7bit',
//       mimetype: 'image/jpeg',
//       destination: './public/temp',
//       filename: 'avatar.jpg',
//       path: 'public\\temp\\avatar.jpg',
//       size: 1433298
//     }
//   ]
// }

//       const avatarLocalPath = req.files?.avatar[0]?.path
//       req.files: is the object containing your uploaded files.
//       ?. : optional chaining, meaning:
//       ➔ "If req.files exists, then go to avatar."
//       avatar[0]: since avatar is an array of file objects, take the first file.
//       ?.path: if the first file exists, get its path property.

    /*
    let coverImageLocalPath = null;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
    {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    */

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path
    console.log("coverImageLocalPath: ", coverImageLocalPath);

    //console.log("req.files: ", req.files);
    //console.log("req.body: ", req.body);

    if(!avatarLocalPath)
    {
        throw new ApiError(400, "Avatar file is required")
    }

    // 5) upload them(Image, avatar) to cloudinary

    const avatar = await uploadOnCloudinary(avatarLocalPath)  // complete response i.e. it has many details, we, at later stages, will fetch what we need. Similarly, for cover image
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // weather avatar and coverImage been uploaded or not on cloudinary, our files from ./public.temp would be deleted as we added in the cloudinary.js code --> fs.unlinkSync(localFilePath)

    if(!avatar){
        throw new ApiError(400, "Avatar is required")
    }

    //console.log("avatar response from cloudinary: \n", avatar)
    //console.log("coverImage response from cloudinary: ", coverImage)

    /*
    avatar response from cloudinary: 
    {
    asset_id: 'bbe2862216bd7248b346cc9c8a0d8a3b',
    public_id: 'i4tlhygtbqtnhs4lnyan',
    version: 1744552765,
    version_id: '214ba072ca0bff330eff073fd0195041',
    signature: 'b6d3863cc60aa631880f951e42ed84f4f4df9809',
    width: 3024,
    height: 4032,
    format: 'jpg',
    resource_type: 'image',
    created_at: '2025-04-13T13:59:25Z',
    tags: [],
    bytes: 1433298,
    type: 'upload',
    etag: 'd1a6de0c53a31fe373b7b65701a0eb73',
    placeholder: false,
    url: 'http://res.cloudinary.com/dna2qh9gf/image/upload/v1744552765/i4tlhygtbqtnhs4lnyan.jpg',
    secure_url: 'https://res.cloudinary.com/dna2qh9gf/image/upload/v1744552765/i4tlhygtbqtnhs4lnyan.jpg',
    asset_folder: '',
    display_name: 'i4tlhygtbqtnhs4lnyan',
    original_filename: 'avatar',
    api_key: '223364694563895'
    }

    similarly for coverImage
*/

    // 8) now create a user object from the details recieved. This user object to be uploaded on MongoDB i.e. enter the details in database

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })


    // 10) remove password and refresh Token
    
    //mongoDB attaches an ID to every entry, with the use of that ID we can fetch user by below Syntax
    // we put those fields in select() which are or to be removed from the database
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // 11) check for user creation in database
    if(!createdUser)
    {
        throw new ApiError(500, "Something went wrong while creating the user")
    }

    // 12) generate response

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
    
})

/*
Working of above function:
The user enters their details and clicks Register.
The frontend sends a request to the server (backend).
The backend (server) runs registerUser.
The server responds with { "message": "ok" }.
The frontend can now show a success message like "Registration Successful!"
NOTE: If this function is linked to a route like /register, then it runs whenever a POST request is made to /register. Eg: app.post("/register", registerUser);
*/

export {registerUser} 