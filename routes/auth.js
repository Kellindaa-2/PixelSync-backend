// sign in / sign up page

import express from "express";
const router = express.Router();

router.get('/login', (req, res) => {
    res.render('auth', {FormType: 'login', layout: false});
});

router.get('/register', (req, res) => {
    res.render('auth', {FormType: 'register', layout: false});
});

router.post('/login', (req, res) => {
    const {email, password} = req.body;
    console.log('Login:', email, password);
    res.send('Just a second, logging you in...');
});

router.post('/register', (req, res) => {
    const {name, email, password} = req.body;
    console.log('Register:', name, email, password);
    res.send('Just a second, registering...');
});

export default router;