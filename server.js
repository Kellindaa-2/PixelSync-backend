import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Middleware to parse form data and JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from frontend's public folder
app.use(express.static(path.join(__dirname, "../PixelSync-frontend/public")));

// Set the views folder and view engine to use EJS templates from frontend
app.set("views", path.join(__dirname, "../PixelSync-frontend/views"));
app.set("view engine", "ejs");

// Use auth routes
app.use("/auth", authRoutes);

// Redirect root to login page (example)
app.get("/", (req, res) => {
  res.redirect("/auth/login");
});

// Route to serve the whiteboard page
app.get("/whiteboard", (req, res) => {
  res.render("whiteboard"); // Make sure whiteboard.ejs exists in views folder
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
