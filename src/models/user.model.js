import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt" // used to hash the password

import jwt from "jsonwebtoken" 
/*
User logs in → Frontend sends username & password to backend.
Backend checks credentials → If correct, it creates a JWT token & sends it to frontend.
Frontend stores the token → So user doesn’t have to log in again.
Frontend sends token in every future request → To prove identity.
Backend verifies token → If valid, request is allowed; otherwise, it’s denied.

No need to check the database every time (Fast authentication)
Every time frontend makes a request to the backend, it sends the token as proof of identity.
*/

const userSchema =  new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,  // removes extra spaces from the beginning and end of the string before saving it
            index: true // helps in searching the username faster
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        fullname: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true
        },

        avatar: {
            type: String, // cloudanary URL: uploadingavatar on a third party site which will store it and return a URLto backend
            required: true,
        },

        coverImage: {
            type: String, // cloudanary URL
            required: true,
        },

        watchHistory:  // Array
        [
            {
                type: Schema.Types.objectId,  // Holds the unique ID of a video.
                ref: "Video"  // Tells MongoDB that "Video" is a schema model where all videos (with their IDs) are stored.
            }
        ],

        password: {
            type: String,
            required: [true, 'Password id required']
        },

        refreshToken: {
            type: String,
        }

}, {timestamps: true})  // timestaps provide when the schema based model is createdAt and UpdatedAt


// pre is a hook which activates when data is just about to reach database. at that point, we do the bcrypt (hashing) of the password
userSchema.pre("save", async function (next) { // process takes time so making it async
    if(!this.isModified("password")) return next(); // only if password is modifies in the user schema then only run bcrypt else move to next process

    this.password = await bcrypt.hash(this.password, 10)
    next()  // tells mongoose to move to the next task
})

userSchema.methods.isPasswordCorrect = async function (password) {  // custom function to check weather password is correct or not
    return await bcrypt.compare(password, this.password) // returns true or flase
}

userSchema.methods.generateAccessToken = function(){
    // sign method generates token
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

// both are JWT generated tokens
// How They Work Together
// User logs in → Backend sends both an access_token and a refresh_token.
// Frontend stores the access_token (short-lived, e.g., 15 minutes).
// For every API request, the frontend sends the access_token.
// If the access_token expires → Backend rejects the request.
// Frontend then sends the refresh_token to the backend.
// If the refresh_token is valid → Backend issues a new access_token.


export const User = mongoose.model("User", userSchema)