import userModel from "../models/usermodel.js"
import { Webhook } from "svix"
import razorpay from 'razorpay'
import transactionModel from "../models/transactionModels.js"

const getUserField = (decoded, keys) => {
  for (const key of keys) {
    const value = decoded?.[key]
    if (value) return value
  }
  return undefined
}

const getOrCreateUser = async (req) => {
  const { clerkId, tokenDecoded } = req
  let user = await userModel.findOne({ clerkId })
  if (!user) {
    const email = getUserField(tokenDecoded, [
      'email',
      'email_address',
      'email_address_verified',
      'email_addresses',
      'primary_email',
    ])

    const emailValue = typeof email === 'string'
      ? email
      : Array.isArray(email)
        ? email[0]?.email_address || email[0]
        : `${clerkId}@clerk.local`

    const photo = getUserField(tokenDecoded, ['picture', 'image_url', 'photo']) || 'https://example.com/default-avatar.png'
    const firstName = getUserField(tokenDecoded, ['first_name', 'given_name', 'firstName']) || ''
    const lastName = getUserField(tokenDecoded, ['last_name', 'family_name', 'lastName']) || ''

    user = await userModel.create({
      clerkId,
      email: emailValue,
      photo,
      firstName,
      lastName,
    })
  }
  return user
}

const clerkWebhooks = async (req,res) =>{
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
        const rawBody = req.rawBody || JSON.stringify(req.body)
        await whook.verify(rawBody, {
             "svix-id": req.headers['svix-id'],
             "svix-timestamp": req.headers['svix-timestamp'],
             "svix-signature": req.headers['svix-signature']
        })

        const { type, data } = req.body
        switch (type) {
            case "user.created":
                const userData = {
                    clerkId: data.id,
                    email: data.email_addresses[0].email_address,
                    photo: data.image_url,
                    firstName: data.first_name,
                    lastName: data.last_name
                }
                await userModel.create(userData)
                res.status(200).json({success:true,message:"User Created"})
                break;
            case "user.updated": {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    photo: data.image_url,
                    firstName: data.first_name,
                    lastName: data.last_name
                }
                await userModel.findOneAndUpdate({clerkId: data.id},userData)
                res.status(200).json({success:true,message:"User Updated"})
                break;
                }
            case "user.deleted": {
                await userModel.findOneAndDelete({clerkId: data.id})
                res.status(200).json({success:true,message:"User Deleted"})
                break;
            }
            default:
                break;
        }

    } catch (error) {
       console.log(error.message)
       res.status(400).json({success:false,message:error.message}) 
    }
}


const userCredits = async (req,res) =>{
    try {
        const { clerkId } = req.body;
        if (!clerkId) return res.status(400).json({ success: false, message: "clerkId required" });
        const userData = await getOrCreateUser(req)

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
        const userData = await getOrCreateUser(req)
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

export { clerkWebhooks, userCredits, paymentRazorpay, verifyRazorpay, getOrCreateUser }
