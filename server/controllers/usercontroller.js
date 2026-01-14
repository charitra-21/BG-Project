import userModel from "../models/usermodel.js"

import razorpay from 'razorpay'
import transactionModel from "../models/transactionModels.js"




const userCredits = async (req,res) =>{
    try {
        const { clerkId } = req.body;
        if (!clerkId) return res.status(400).json({ success: false, message: "clerkId required" });
        const userData = await userModel.findOne({ clerkId })
        if (!userData) return res.status(404).json({ success: false, message: "User not found" });

        res.json({success:true, credits:userData.creditBalance})
    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const paymentRazorpay = async(req,res) =>{
    try {
        
        const { clerkId, planId } = req.body
        const userData = await userModel.findOne({ clerkId })
        if(!userData || !planId){
            return res.json({success:false, message:'Invalid Credentials'})
        }

        let credits, plan, amount, date

        switch (planId) {
            case 'Basic':
                plan = 'Basic'
                credits = 100
                amount = 10
                break;
            case 'Advanced':
                plan = 'Advanced'
                credits = 500
                amount = 50
                break;
            case 'Business':
                plan = 'Business'
                credits = 5000
                amount = 250
                break;
        
            default:
                break;
        }

        date = Date.now()

        const transactionData = {
            clerkId,
            plan,
            amount,
            credits,
            date
        }
         
        const newTransaction = await transactionModel.create(transactionData)

        const options = {
            amount: amount *100,
            currency: process.env.CURRENCY,
            receipt: newTransaction._id
        }

        await razorpayInstance.orders.create(options,(error,order)=>{
            if(error){
                return res.json({success:false,message:error})
            }
            res.json({success:true,order})
        })

    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}

const verifyRazorpay = async (req,res) =>{
    try {
        
        const { razorpay_order_id } = req.body
        
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        if(orderInfo.status === 'paid'){

            const transactionData = await transactionModel.findById(orderInfo.receipt)
            // if(transactionData.payment){
            //     return res.json({success: false,message:'Payment Failed'})
            // }
            if (transactionData.payment === true) {
  return res.status(200).json({ success: true, message: "Payment already processed" });
}

            const userData = await userModel.findOne({clerkId: transactionData.clerkId})
            const creditBalance = userData.creditBalance + transactionData.credits
            await userModel.findByIdAndUpdate(userData._id,{creditBalance})

            await transactionModel.findByIdAndUpdate(transactionData._id,{payment:true})

            res.json({success:true, message:"Credits Added"});
        }   
    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}

export { userCredits, paymentRazorpay, verifyRazorpay}
