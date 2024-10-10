import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Токен не предоставлен" });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        console.log("JWT валидация не удалась: токен истёк");
        return res.status(401).json({ message: "Токен истёк" });
      }
      console.log("JWT валидация не удалась:", err);
      return res.status(401).json({ message: "Неверный токен" });
    }

    req.user = user;
    next();
  });
};
