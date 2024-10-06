import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import projectItems from "./projectItems.cjs";
import pkg from "pg";
const { Client } = pkg;
import bcrypt from "bcrypt";
import knex from "knex";

const postgres = knex({
  client: "pg",
  connection: process.env.LOCALDB_URL,
});

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use("/img", express.static("./img"));
app.use(express.json());

app.get("/api/test", (_, res) => {
  res.json({ message: "Server connected to frontend" });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "1234") {
    res.status(200).json({ username: username, password: password });
  } else {
    res.status(401).json({ message: "invalid credentials" });
  }
});

app.get("/api/cards", (req, res) => {
  const searchTerm = req.query.search.toLocaleLowerCase();
  const filteredProjects = projectItems.filter((item) => {
    return item.title
      .concat(item.description)
      .toLocaleLowerCase()
      .includes(searchTerm);
  });

  res.json(filteredProjects);
});

app.get("/api/cardsdb", async (req, res) => {
  try {
    const searchTerm = req.query.search ? req.query.search.toLowerCase() : "";

    let projectsQuery = postgres("projects").select("*");
    console.log(projectsQuery);
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
      process.env.REACT_APP_API_BASE_URL ||
      `https://server-ancient-grass-9030.fly.dev`;
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
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await postgres("users").insert({
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during signup:", error);
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
