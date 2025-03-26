import { DB_NAME } from "../constants.js";
import mongoose from "mongoose"; // used to connect with database using below syntax

const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`)

        /*
        app.listen(process.env.PORT, () =>{
            console.log(`App is listening on port ${process.env.PORT}`);
        })
        */
    }
    catch (error){
        console.log("MongoDB connection ERROR: ", error);
        process.exit(1);
    }
}

export default connectDB