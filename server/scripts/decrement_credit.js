import 'dotenv/config'
import connectDB from '../configs/mongodb.js'
import userModel from '../models/usermodel.js'

await connectDB()

const clerkId = 'test'
const user = await userModel.findOne({ clerkId })
if (!user) {
  console.error('Test user not found')
  process.exit(1)
}

const updated = await userModel.findOneAndUpdate({ clerkId }, { $inc: { creditBalance: -1 } }, { new: true })
console.log('Updated user creditBalance:', updated.creditBalance)
process.exit(0)
