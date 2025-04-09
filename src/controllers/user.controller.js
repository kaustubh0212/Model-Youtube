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
    const {fullName, email, username, password} = req.body  // req.body provides data from frontend
    console.log("fullName: ", fullName);
    console.log("email: ", email);
    console.log("username: ", username);
    console.log("password: ", password);
    
    // 2) validation: data is not empty and in correct format
    
    /*
    if(fullName === "")
    {
        throw new ApiError(400, "FullName is Empty");
    }
    */

    if([fullName, email, username, password].some((field) => field?.trim() === ""))
    {
        throw new ApiError(400, "All fienlds are required")
    }

    // 3) check if user already exists through username and email
    /*
    User.findOne({username}) // if same username return error
    User.findOne({email}) // if same email return error
    */

    const existedUser = User.findOne({  // if existed user is there then its schema is already created and hence we can simply search for it using User.findOne() where User is the copy of UserSchema we created
        $or: [{username}, {email}]
    })

    if(existedUser) {
        throw new ApiError(409, "User With email or username already exist")
    }

    // 4) check for Images, check for avatar using multer

    /*
    beginner friendly syntax:

    let avatarLocalPath;
    if (req.files && req.files.avatar && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path;
    } else {
        avatarLocalPath = undefined; // or set a default path if you want
    }
    */

    
    const avatarLocalPath = req.files?.avatar[0]?.path
    // avatar has many properties like file type(jpg, png, etc) and other properties. we want the first one so avatar[0].
//     eg. for above:
    
//     req.files = {
//         avatar: [
//           {
//             fieldname: 'avatar',
//             originalname: 'profile.jpg',
//             encoding: '7bit',
//             mimetype: 'image/jpeg',
//             destination: './public/temp',
//             filename: 'profile.jpg',
//             path: 'public/temp/profile.jpg',
//             size: 12345
//           }
//         ]
//       }

//       const avatarLocalPath = req.files?.avatar[0]?.path
//       req.files: is the object containing your uploaded files.
//       ?. : optional chaining, meaning:
//       ➔ "If req.files exists, then go to avatar."
//       avatar[0]: since avatar is an array of file objects, take the first file.
//       ?.path: if the first file exists, get its path property.


    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath)
    {
        throw new ApiError(400, "Avatar file is required")
    }

    // 5) upload them(Image, avatar) to cloudinary

    const avatar = await uploadOnCloudinary(avatarLocalPath)  // complete response i.e. it has many details, we, at later stages, will fetch what we need. Similarly, for cover image
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar is required")
    }

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
    
    //mongoDB attaches an ID to everyentry, with the use of that ID we can fetch user by below Syntax
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

// Working of above function:
// The user enters their details and clicks Register.
// The frontend sends a request to the server (backend).
// The backend (server) runs registerUser.
// The server responds with { "message": "ok" }.
// The frontend can now show a success message like "Registration Successful!"
// NOTE: If this function is linked to a route like /register, then it runs whenever a POST request is made to /register. Eg: app.post("/register", registerUser);

export {registerUser}