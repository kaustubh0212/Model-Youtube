//require('dotenv').config({path: './env'})
import dotenv from 'dotenv';

import express from "express"
const app = express()

import connectDB from "./db/db.js";

dotenv.config({ path: './env' });  // used in a Node.js application to load environment variables from a file named env (located in the root directory) into process.env. 

//connectDB()

connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})
