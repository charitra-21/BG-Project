import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './configs/mongodb.js'
import userRouter from './routes/userRoutes.js'
import imageRouter from './routes/imageRoutes.js'



const PORT = process.env.PORT || 4000
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())
await connectDB()

app.get('/',(req,res)=> res.send("API Working"))
app.use('/api/user',userRouter)
app.use('/api/image',imageRouter)
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', path: req.path });
});

app.listen(PORT, ()=>console.log("Server Running on port " +PORT))
