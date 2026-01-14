import { Webhook } from "svix";
import connectDB from "../../server/configs/mongodb.js";
import userModel from "../../server/models/usermodel.js";

export const config = {
  api: {
    bodyParser: false, // REQUIRED for Clerk
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    // Get raw body
    const rawBody = await new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => resolve(body));
      req.on("error", reject);
    });

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const event = wh.verify(rawBody, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { type, data } = event;

    if (type === "user.created") {
      await userModel.create({
        clerkId: data.id,
        email: data.email_addresses[0].email_address,
        firstName: data.first_name,
        lastName: data.last_name,
        photo: data.image_url,
        creditBalance: 5,
      });
    }

    if (type === "user.deleted") {
      await userModel.findOneAndDelete({ clerkId: data.id });
    }

    if (type === "user.updated") {
      await userModel.findOneAndUpdate(
        { clerkId: data.id },
        {
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        }
      );
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Clerk webhook error:", err.message);
    return res.status(400).json({ error: err.message });
  }
}
