// This middleware will verify whether the user exist or not in the database
// Middleware has req, res, next

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// to check wether uer is logined or not
// next : job done, move to next step
export const verifyJWT = asyncHandler( async(req, res, next) =>{
    try {
        // trying to fetch token from browser. If user is logged in, access token exist else doesn't exist.
        // Check cookieParser in app.js for details
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        // req.header("Authorization")?.replace("Bearer ", ""), request may come from phone also
    
        if(!token)
        {
            console.log("token: ", token)
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // jwt.verify() provides decoded token because browser has encrypted token
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        console.log("\nauth.middleware.js\n user:\n", user)
    
        if(!user)
        {
            //console.log("")
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user; // we are creating req.user (custom) on our own
        next()

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})