import "dotenv/config";
import app from "./app.js";
import postgres from "./db.js";

const port = process.env.PORT ?? 5000;

(async function connectToDatabase() {
  try {
    await postgres.raw("SELECT 1+1 AS result");
    console.log("Successful connection to database");
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
})();

app.listen(port, () => console.log(`Server is running on port: ${port}`));
