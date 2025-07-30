const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.urlendcoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, ',,/PixelSync-frontend/public')));

app.set('views', path.join(__dirname, 'PixelSync-frontend/views'));
app.set('view engine', 'ejs');

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});