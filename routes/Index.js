import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';

import authRoutes from './auth.js';
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    });