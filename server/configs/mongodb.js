import mongoose from "mongoose"

const connectDB =async()=>{
    
    mongoose.connection.on('connnected',()=>{
        console.log("DataBase Connected")
    })

    await mongoose.connect(`${process.env.MONGODB_URI}/bg-removal`)
}

export default connectDB