// This middle ware will verify whether the user exist or not in the databse
// middleware has req, res, next

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// to check wether uer is logined or not
// next : job done, move to next step
export const verifyJWT = asyncHandler( async(req, res, next) =>{
    try {
        // check cookieParser in app.js for details
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token)
        {
            console.log("token: ", token)
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        console.log("auth.middleware.js\n\n user:\n", user)
    
        if(!user)
        {
            //console.log("")
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user; // we are createing req.user (custom) on our own
        next()

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})