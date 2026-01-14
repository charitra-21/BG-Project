import express from 'express'
import { paymentRazorpay, userCredits, verifyRazorpay } from '../controllers/usercontroller.js'
import authUser from '../middlewares/auth.js'

const userRouter = express.Router()
userRouter.get('/credits',authUser,userCredits)
userRouter.post('/pay-razor',authUser,paymentRazorpay)
userRouter.post('/verify-razor',verifyRazorpay)

export default userRouter