import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  try {
    // Accept both `token` header and standard `Authorization: Bearer <token>` header
    let token = req.headers.token || req.headers.authorization || req.headers.Authorization;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token, authorization denied" });
    }
    if (typeof token === 'string' && token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }

    const token_decode = jwt.decode(token);
    const clerkId = token_decode?.clerkId || token_decode?.sub || token_decode?.userId || token_decode?.user_id;
    if (!token_decode || !clerkId) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // Ensure req.body exists for GET requests and attach clerkId both on body and root for compatibility
    req.body = req.body || {};
    req.body.clerkId = clerkId;
    req.clerkId = clerkId;
    req.tokenDecoded = token_decode;
    return next();
  } catch (err) {
    console.error("authUser error:", err);
    return res.status(500).json({ success: false, message: "Auth error" });
  }
};

export default authUser;
