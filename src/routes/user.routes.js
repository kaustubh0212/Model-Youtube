import { Router } from "express"; 
import { logoutUser, registerUser, loginUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post(
    
    upload.fields([
        {
            name: "avatar",    
            // when user registering, its avatar is uploaded
            maxCount: 1
        },
        {
            name: "coverImage",       
            // when user registering, its image is uploaded
            maxCount: 1
        }

    ]),
    registerUser)

// #region Description
/*
finalURL: http://localhost:8000/api/v1/users/login (/api/v1/users came from app.js)
A user is trying to register with name, email, and password → That’s new data for the database → So we use post.

Some common examples:
GET /users → Get all users
GET /user/123 → Get details of user with ID 123
POST /register → Register a new user
POST /login → Login a user
PUT /user/123 → Replace user data
PATCH /user/123 → Update user email only
DELETE /user/123 → Delete user with ID 123
*/
// #endregion


router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT, logoutUser)

export default router