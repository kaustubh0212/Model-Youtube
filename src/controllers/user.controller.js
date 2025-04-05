import { asyncHandler } from "../utils/asyncHandler.js";

// registerUser is a function
const registerUser = asyncHandler( async(req, res) => {
    return res.status(200).json({ 
        message: "ok"
    })
})

// Working of above function:
// The user enters their details and clicks Register.
// The frontend sends a request to the server (backend).
// The backend (server) runs registerUser.
// The server responds with { "message": "ok" }.
// The frontend can now show a success message like "Registration Successful!"
// NOTE: If this function is linked to a route like /register, then it runs whenever a POST request is made to /register. Eg: app.post("/register", registerUser);

export {registerUser}