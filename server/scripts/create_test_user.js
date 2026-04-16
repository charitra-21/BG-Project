import 'dotenv/config'
import connectDB from '../configs/mongodb.js'
import userModel from '../models/usermodel.js'

await connectDB()

const clerkId = 'test'
const existing = await userModel.findOne({ clerkId })
if (existing) {
  console.log('Test user already exists:', existing)
  process.exit(0)
}

const userData = {
  clerkId,
  email: 'test@example.com',
  photo: 'https://example.com/avatar.png',
  firstName: 'Test',
  lastName: 'User',
  creditBalance: 5,
}

const created = await userModel.create(userData)
console.log('Created test user:', created)
process.exit(0)
