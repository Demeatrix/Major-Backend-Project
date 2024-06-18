import dotenv from "dotenv";
import connectDB from './db/index.js';

// require("dotenv").config();

// import mongoose from "mongoose";

dotenv.config({
    path: "./env"
})


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port, ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("MongoDB connection FAILED:", err)
})