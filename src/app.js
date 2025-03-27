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

app.use(cookieParser()) // helps in setting the cookies of the user on the browser

export { app }
