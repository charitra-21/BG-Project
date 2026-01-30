import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  try {
    const {token} = req.headers;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token, authorization denied" });
    }
    const token_decode = jwt.decode(token)
    req.body.clerkId = token_decode.clerkId
    return next();
  } catch (err) {
    console.error("authUser error:", err);
    return res.status(500).json({ success: false, message: "Auth error" });
  }
};

export default authUser;
