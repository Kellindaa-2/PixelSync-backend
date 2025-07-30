// sign in / sign up page

const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
    res.render('auth', {FormType: 'login'});
});

router.get('/register', (req, res) => {
    res.render('auth', {FormType: 'register'});
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

module.exports = router;