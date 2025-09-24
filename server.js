// Temporary fix - bypass auth check
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
console.log("🔥 Firebase auth bypassed - server should start now");

import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import searchRoutes from "./routes/search.js";
import expressLayouts from 'express-ejs-layouts';
import { createRequire } from "module";

const require = createRequire(import.meta.url);
let firebaseConfig = {};
try {
  // Try to load the local firebaseConfig.json
  firebaseConfig = require("./firebase/firebaseConfig.json");
} catch (err) {
  console.warn('No local firebase/firebaseConfig.json found or it failed to load. Falling back to environment variables.');
}

// Allow environment variables to override the config (useful on live servers)
firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || firebaseConfig.apiKey || 'REPLACE_WITH_YOUR_API_KEY',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain || 'REPLACE_WITH_YOUR_PROJECT.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId || 'pixelsync-3f79a',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket || 'REPLACE_WITH_YOUR_PROJECT.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId || 'REPLACE_WITH_SENDER_ID',
  appId: process.env.FIREBASE_APP_ID || firebaseConfig.appId || 'REPLACE_WITH_APP_ID'
};

if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith('REPLACE')) {
  console.warn('Firebase API key is not set or is a placeholder. Set FIREBASE_API_KEY in environment variables or update firebase/firebaseConfig.json with a valid web API key.');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Middleware to parse form data and JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
// Serve static files from frontend's public folder
app.use(express.static(path.join(__dirname, "../PixelSync-frontend/public")));

app.set("views", path.join(__dirname, "../PixelSync-frontend/views"));
app.set("view engine", "ejs");

app.get('/firebaseConfig', (req, res) => {
  res.json(firebaseConfig);
});

app.use(expressLayouts);
app.set("layout", "layout");

// Determine live-only mode. When true, the server should only expose the dashboard and static assets.
const isLiveOnly = process.env.LIVE_SERVER === '1' || process.env.NODE_ENV === 'production';

if (isLiveOnly) {
  console.log('⚠️ Running in LIVE_ONLY mode — only dashboard and static assets will be exposed');
  // Only mount the dashboard routes. Keep /firebaseConfig for client init.
  // Also mount auth routes so users can log in — otherwise authenticateUser will redirect to /auth/login
  // which isn't available and would cause a redirect loop.
  app.use("/auth", authRoutes);
  app.use("/dashboard", dashboardRoutes);

  // Redirect root to dashboard
  app.get('/', (req, res) => res.redirect('/dashboard'));

  // Catch-all middleware for GET requests: allow static assets and /firebaseConfig; otherwise redirect to /dashboard
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    const p = req.path;
    // Allow requests for files in the public folder (static assets)
    if (p.startsWith('/assets') || p.startsWith('/js') || p.startsWith('/css') || p.startsWith('/favicon') || p.startsWith('/images')) {
      return next();
    }
    // Allow the firebaseConfig endpoint
    if (p === '/firebaseConfig') return next();
    // Allow dashboard paths
    if (p.startsWith('/dashboard')) return next();
    return res.redirect('/dashboard');
  });
} else {
  // Development / normal mode: mount all routes
  app.use("/auth", authRoutes);
  app.use("/dashboard", dashboardRoutes);
  app.use("/search", searchRoutes);

  // Redirect root to login page
  app.get("/", (req, res) => {
    res.redirect("/auth/login");
  });
}

// Route to serve the whiteboard page
app.get("/whiteboard", (req, res) => {
  // Get board data from query parameters
  const boardData = {
    name: req.query.name || 'Untitled Board',
    classCode: req.query.class || '',
    tags: req.query.tags || ''
  };
  
  console.log('Loading whiteboard with data:', boardData);
  
  res.render("whiteboard", { 
    layout: false,
    boardData: boardData
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
