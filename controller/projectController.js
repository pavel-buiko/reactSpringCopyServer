import dotenv from "dotenv";
import { getProjects } from "../model/projectModel.js";

dotenv.config();

export const getCards = async (req, res) => {
  try {
    const userId = req.user.userId;
    const username = req.user.username;
    console.log(`User ${username} (ID: ${userId}) is requesting cards.`);

    const searchTerm = req.query.search ? req.query.search.toLowerCase() : "";

    const projects = await getProjects(searchTerm);

    const apiBaseUrl =
      process.env.REACT_APP_API_BASE_URL ??
      "https://server-ancient-grass-9030.fly.dev";
    const projectsWithImgSrc = projects.map((project) => ({
      ...project,
      imgSrc: `${apiBaseUrl}${project.img_src}`,
    }));

    res.json(projectsWithImgSrc);
  } catch (error) {
    console.error("Error getting projects:", error);
    res.status(500).json({ error: "Cannot get projects" });
  }
};
