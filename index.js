import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pkg from "pg";
const { Client } = pkg;
import bcrypt from "bcrypt";
import knex from "knex";
import jwt from "jsonwebtoken";

dotenv.config();

const postgres = knex({
  client: "pg",
  connection: process.env.LOCALDB_URL,
});

const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use("/img", express.static("./img"));
app.use(express.json());

app.get("/api/test", (_, res) => {
  res.json({ message: "Server connected to frontend" });
});

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

let refreshTokens = [];

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token is not provided" });

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: "Invalid tokn" });
    req.user = user;
    next();
  });
}

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await postgres("users").where({ username }).first();

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
      expiresIn: "3s",
    });
    const refreshToken = jwt.sign(userPayload, REFRESH_TOKEN_SECRET, {
      expiresIn: "50s",
    });

    refreshTokens.push(refreshToken);
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
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/token", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(401).json({ message: "Token not provided" });
  if (!refreshTokens.includes(refreshToken))
    return res.status(403).json({ message: "Invalid token" });

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });

    const userPayload = {
      userId: user.userId,
      username: user.username,
    };

    const newAccessToken = jwt.sign(userPayload, ACCESS_TOKEN_SECRET, {
      expiresIn: "30s",
    });

    res.json({ accessToken: newAccessToken });
  });
});

app.post("/api/logout", (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.status(200).json({ message: "User quit app" });
});

app.get("/api/cards", authenticateToken, async (req, res) => {
  try {
    const searchTerm = req.query.search ? req.query.search.toLowerCase() : "";

    let projectsQuery = postgres("projects").select("*");
    if (searchTerm) {
      projectsQuery = projectsQuery.where(function () {
        this.whereRaw("LOWER(title) LIKE ?", [`%${searchTerm}%`]).orWhereRaw(
          "LOWER(description) LIKE ?",
          [`%${searchTerm}%`]
        );
      });
    }
    const projects = await projectsQuery;

    const apiBaseUrl =
      process.env.LOCALSERVER ?? `https://server-ancient-grass-9030.fly.dev`;
    const projectsWithImgSrc = projects.map((project) => ({
      ...project,
      imgSrc: `${apiBaseUrl}${project.img_src}`,
    }));

    res.json(projectsWithImgSrc);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

app.post("/api/signup", async (req, res) => {
  const { firstName, lastName, username, password, confirmPassword, age } =
    req.body;

  const errors = {};

  if (!firstName || firstName.trim().length < 3) {
    errors.firstName = "First name must be at least 3 characters long.";
  }

  if (!lastName || lastName.trim().length < 3) {
    errors.lastName = "Last name must be at least 3 characters long.";
  }

  if (!username || username.trim().length < 3) {
    errors.username = "Username must be at least 3 characters long.";
  }

  if (!password) {
    errors.password = "Please enter a password.";
  } else {
    if (password.length < 4) {
      errors.password = "Password must be at least 4 characters long.";
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      errors.password =
        "Password must contain at least one letter and one number.";
    }
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  const ageNumber = Number(age);
  if (!age) {
    errors.age = "Please specify your age.";
  } else if (isNaN(ageNumber)) {
    errors.age = "Age must be a number.";
  } else if (ageNumber <= 0) {
    errors.age = "Age cannot be zero or negative.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const existingUser = await postgres("users").where({ username }).first();

    if (existingUser) {
      return res
        .status(400)
        .json({ errors: { username: "Username is already taken." } });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await postgres("users").insert({
      firstName,
      lastName,
      username,
      password: hashedPassword,
      age: ageNumber,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(port, () => console.log(`Server is running on port ${port}`));

const client = new Client({
  connectionString: process.env.LOCALDB_URL,
});

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Successfully connected to the database");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  } finally {
    await client.end();
  }
}

connectToDatabase();
