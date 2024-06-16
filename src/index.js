import dotenv from "dotenv";
import connectDB from './db/index.js';

// require("dotenv").config();

// import mongoose from "mongoose";

dotenv.config({
    path: "./env"
})


connectDB();

/*
basic apporoach

import express from "express";
const app = express()
;( async()=> {
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on('error', (error)=> {
        console.log("ERROR:", error)
        throw error
       })

       app.listen(process.env.PORT, ()=> {
        console.log(`app is listening on port", ${process.env.PORT}`);
       } )
    } catch (error) {
        console.log("ERROR:", error)
        throw err
    }
})()
*/