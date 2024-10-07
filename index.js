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

const jwtToken = process.env.JWT;
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use("/img", express.static("./img"));
app.use(express.json());

app.get("/api/test", (_, res) => {
  res.json({ message: "Server connected to frontend" });
});

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

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      jwtToken,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/cards", async (req, res) => {
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
