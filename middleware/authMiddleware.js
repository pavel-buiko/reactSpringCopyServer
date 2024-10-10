import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        console.log("JWT validation failed: token expired");
        return res.status(401).json({ message: "Token expired" });
      }
      console.log("JWT validation failed:", err);
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  });
};
