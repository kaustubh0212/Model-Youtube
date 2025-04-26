import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,  // if the frontend request comes from CORS_ORIGIN then backend will accept it else backend will reject it. 
    credentials: true
}))

app.use(express.json({limit: "16kb"})) // backend will take the data from request sender only upto 16kb json not more. But backend can send data as much as it want
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))

app.use(cookieParser())
// cookieParser() is a middleware. When you use it, it automatically reads the cookies attached to the incoming request (req) and adds them into req.cookies!
// You open a website → you click "Login" → browser sends your email/password to the server. That sending action is called an "incoming request."
// When browser sends that request (like GET / POST / etc), it automatically attaches cookies (like accessToken, refreshToken) along with it. It reads the cookies from the incoming request
// Each individual user's access and refresh token are stored in their own browser cookies. When that specific user sends a request, cookie-parser reads only their cookies and attaches to req.cookies


// routes import

import userRouter from './routes/user.routes.js'


// routes declaration

app.use("/api/v1/users", userRouter)
//whenever use will go for /users extension, userRouter will run (OR the code will direct to userRouter file)

export { app }
