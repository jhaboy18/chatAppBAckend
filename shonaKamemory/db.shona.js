import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config();


 export const shonadb=async()=>{
    try{
     await   mongoose.connect(process.env.SHONA_MEMORY)
        console.log("Shona ka dimag chl rha hai")

    }
    catch(err){
        console.log('Something error in shona',err)
    }
}