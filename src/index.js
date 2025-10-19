// NOTE: our source file is src/index.js i.e. this one. So, whenever we run the code "npm run dev" this file runs first.

//require('dotenv').config({path: './env'})
import { app } from './app.js'; // imporatant to import because all the routes are written in app.js only
import dotenv from 'dotenv';

import connectDB from "./db/db.js";

dotenv.config({ path: './env' });  // used in a Node.js application to load environment variables from a file named env (located in the root directory) into process.env. 

connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})