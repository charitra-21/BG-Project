import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  try {
    const rawTokenHeader = req.headers.token || req.headers.authorization || "";

    const token = rawTokenHeader.startsWith("Bearer ")
      ? rawTokenHeader.slice(7)
      : rawTokenHeader;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized — token missing" });
    }

    const decoded = jwt.decode(token);
    // console.log('[AUTH DEBUG] decoded exists?', !!decoded, 'decoded keys:', decoded ? Object.keys(decoded) : null);
    if (!decoded) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const clerkId = decoded.sub || decoded.clerkId || decoded.userId || null;

    if (!req.body || typeof req.body !== "object") {

      req.body = {};
    }

    req.body.clerkId = clerkId;
    req.clerkId = clerkId;
    req.authPayload = decoded;

    return next();
  } catch (err) {
    console.error("authUser error:", err);
    return res.status(500).json({ success: false, message: "Auth error" });
  }
};

export default authUser;
