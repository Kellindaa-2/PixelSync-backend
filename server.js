import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import expressLayouts from 'express-ejs-layouts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, '../PixelSync-frontend/public')));

app.set('views', path.join(__dirname, '../PixelSync-frontend/views'));
app.set('view engine', 'ejs');

app.use(expressLayouts);
app.set('layout', 'layout');

// Use auth routes
app.use('/auth', authRoutes);

// Dashboard routes
app.use('/dashboard', dashboardRoutes);

// Default route - redirect to login
app.get('/', (req, res) => {
    res.redirect('/auth/login');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});