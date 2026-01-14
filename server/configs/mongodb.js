import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log("Database Connected");
        });
        if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI");
        await mongoose.connect(`${process.env.MONGODB_URI}/bg-removal`)

    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
};

export default connectDB;
