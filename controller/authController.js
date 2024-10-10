import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByUsername, createUser } from "../model/userModel.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await findUserByUsername(username);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const userPayload = {
      userId: user.id,
      username: user.username,
    };

    const accessToken = jwt.sign(userPayload, ACCESS_TOKEN_SECRET, {
      expiresIn: "30s",
    });

    const refreshToken = jwt.sign(userPayload, REFRESH_TOKEN_SECRET, {
      expiresIn: "2m",
    });
    console.log("Generated Refresh Token:", refreshToken);

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        userId: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshToken = (req, res) => {
  const { refreshToken } = req.body;

  console.log("Received Refresh Token for Refresh:", refreshToken);
  if (!refreshToken)
    return res.status(401).json({ message: "Token not provided" });

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    const userPayload = {
      userId: user.userId,
      username: user.username,
    };

    const newAccessToken = jwt.sign(userPayload, ACCESS_TOKEN_SECRET, {
      expiresIn: "30s",
    });

    res.json({ accessToken: newAccessToken });
  });
};

export const logout = (req, res) => {
  res.status(200).json({ message: "Successfully logged out" });
};

export const signup = async (req, res) => {
  const { firstName, lastName, username, password, age } = req.body;

  try {
    const existingUser = await findUserByUsername(username);

    if (existingUser) {
      return res
        .status(400)
        .json({ errors: { username: "Username is already taken." } });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await createUser({
      firstName,
      lastName,
      username,
      password: hashedPassword,
      age,
    });

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
