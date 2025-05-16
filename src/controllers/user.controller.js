//import { verify } from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()


        user.refreshToken = refreshToken // setting value of refreshToken for the already created user. this token is now also part of MongoDB database

        await user.save({validateBeforeSave: false}) //After editing the database by adding refreshToken, save the database. Also, "{validateBeforeSave: false}" is required because while saving, all the must required fields are also triggered i.e. demanding that they should also be present but we confirm that we dont need to enter all that

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went Wrong while generating refresh and access token")
    }
}
 
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

    // if existed user is there then its schema is already created and hence we can simply search for it using User.findOne() where User is the copy of UserSchema we created
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
        // The $or syntax in MongoDB (and Mongoose) is used to search for documents that match _any_** of the given conditions**, not all of them.
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
    // we put those fields in select() which are or to be removed from the output coming from the database but does not remove in the database
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
        //  201 is actual HTTP response thay goes to the browser
        // json body response
        // mostly both are same
    )
    
})

// Working of above function:
// The user enters their details and clicks Register.
// The frontend sends a request to the server (backend).
// The backend (server) runs registerUser.
// The server responds with { "message": "ok" }.
// The frontend can now show a success message like "Registration Successful!"
// NOTE: If this function is linked to a route like /register, then it runs whenever a POST request is made to /register. Eg: app.post("/register", registerUser);

const loginUser = asyncHandler( async (req, res) => {
    /*
    1) req body -> data
    2) username or email, one must be there
    3) find the user
    4) password check
    5) Create access and refresh token
    6) send cookie
    */

    // 1) req body -> data
    const {email, username, password} = req.body

    // 2) username or email, one must be there
    if(!username && !email)
    {
        throw new ApiError(400, "username or email is required")
    }

    // 3) find the user
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    // 4) password check

    const isPasswordValid = await user.isPasswordCorrect(password)
    //Very Important Note: we used "user" not "User" which we imported because "User" will be used only when we need predefined functions of MongoDB. But when we need Custom defined functions i.e. what we created in UserSchema, we need to use user whci we used to extract details of existing user from the database

    if(!isPasswordValid){
        throw new ApiError(404, "Incorrect password given by user")
    }


    // 5) Create access and refresh token

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)


    // 6) send cookie

    const loggedInUser = await User.findById(user._id).select(" -password -refreshToken")

    /*
    because the user we currently hold lacks refreshTOken as data so recalling from the database OR other way is:
    user.refreshToken = refreshToken
    */

    const options = {
        // to make sure that cookie is edited from the server / backend only and not the frontend (views only)
        httpOnly: true, // JavaScript on frontend cannot read/edit this cookie (protects from XSS)
        secure: true // Only sent over HTTPS
    }

    //console.log("Every thing looks good, only respnse to send")

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)  // cookie is stored in the browser for next time verification
    .cookie("refreshToken", refreshToken, options)
    .json(
        // this reponse goes to frontend
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in Successfully"
        )
    )

})


const logoutUser = asyncHandler(async(req, res) =>{
    // Need to reset both access token and refresh token
    // See logout routes and auth.middleware.js
    // in auth.middleware.js, we created req.user because we didn't had direct access to user data during logout process

    // clearing cookie from database
    
    const updated = await User.findByIdAndUpdate(
        req.user._id, // how to search
        {
            $set: {  // what to update
                refreshToken: undefined,
            }
        },
        { // to return new value of refreshToken
            new: true
        }
    )

    //console.log("updated:", updated);

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)  // clearing cookie from browser
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))
})


const refreshAccessToken = asyncHandler( async(req, res) => {

    /*
    todos:
    step 1: fetch refresh token from user browser
    step 2: throw error if refresh token not recieved
    step 3: Decode the fetched refresh token
    step 4: fetch user from database from the id recieved while decoding and get refresh token held by database. Compare both the refresh token.

    */

    try {
        // step 1: fetch refresh token from user browser
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
        /*
        req.body.refreshToken : if refresh token is coming from mobile
        
        Web browser (like Chrome) → refresh token is usually stored in cookies. So, req.cookies.refreshToken will have it.
        
        Mobile app (like Android/iOS apps) → mobile apps don't automatically use cookies well. Instead, mobile apps send refresh token manually inside request body (like in POST JSON data). So, we need to check req.body.refreshToken. ✅ Works fine for mobile too.
        */
    
        // step 2: throw error if refresh token not recieved
        if(!incomingRefreshToken)
        {
            throw new ApiError(401, "unauthorized request")
        }
    
        // step 3: Decode the fetched refresh token from browser
        /*
            when decoded data will come out in below format because in this format only we submitted the data i.e. 
        return jwt.sign(
                    {
                        _id: this._id
                    },
                    process.env.REFRESH_TOKEN_SECRET,
                    {
                        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
                    }
                )
        */
    
        const decodedRefreshToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        // jwt.verify() provides decoded token because browser has encrypted token
    
        const user = await User.findById(decodedRefreshToken?._id)
    
        if(!user)
        {
            throw new ApiError(401, "Invalid Refresh Token")
        }
    
        // step 4: fetch user from database from the id recieved while decoding and get refresh token held by database. Compare both the refresh token
    
        if(incomingRefreshToken !== user?.refreshToken)
        {
            throw new ApiError(401, "Refresh token is expired or use")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const [newAccessToken, newRefreshToken] = generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", newAccessToken, options)
        .cookie("aefreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {newAccessToken, refreshToken: newRefreshToken},
                "Access Token refreshed successfully"
            )
        )
    } catch (error) {
        
        throw new ApiError(401, error?.message || "Invalid Refresh Token due to some error")
    }
})

const changeCurrentPassword = asyncHandler( async(req, res) =>{
    // password changing i.e. user is logged in
    const {oldPassword, newPassword} = req.body;
    
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect)
    {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler( async(req, res) =>{
    return res
    .status(200)
    .json(200, req.user, "curret user fetched successfully")
})

const updateAccountDetails = asyncHandler( async(req, res) => {
    const {fullName, email} = req.body

    if(!fullName || !email)
    {
        throw new ApiError(480, "All Fields are required")
    }

    User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                email: email,
            }
        },
        {new: true},
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler( async(req, res) =>{

    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath)
    {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url)
    {
        throw new ApiError(400, "Error while uploading on Avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar updated successfully")
    )
})

const updateUserCoverImage = asyncHandler( async(req, res) =>{

    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath)
    {
        throw new ApiError(400, "Cover Image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverLocalPath)

    if(!coverImage.url)
    {
        throw new ApiError(400, "Error while uploading on Cover Image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover Image updated successfully")
    )
})

export {
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
} 