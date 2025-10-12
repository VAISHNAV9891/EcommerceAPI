import express from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'//Import the variables from .env file

const app = express();//Make a server structure
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;



app.use(express.json());//Use the middleware in the server -> json package opener


//handle the requests here which comes on the various routes



mongoose.connect(MONGO_URL).then(() => {
    console.log("Database is successfully connected to the server !");

    app.listen(PORT, () => {
        console.log(`The server is running on the PORT : ${PORT}}`);
    })
}).catch((error) => {
     console.error("There's some error connecting to the database :", error);
})

