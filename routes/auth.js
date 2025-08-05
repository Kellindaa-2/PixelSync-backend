// sign in / sign up page

import express from "express";
import { admin, db } from '../firebase/firebaseAdmin.js';

const router = express.Router();

// middleware/firebaseAuth.js
export const authenticateFirebaseToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) return res.status(401).send("No token provided");

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send("Invalid token");
  }
};
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

router.post('/register', async (req, res) => {
    const {name, email, password} = req.body;
    console.log('Register:', name, email, password);
    res.send('Just a second, registering...');
    try {
        // Create user in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: name
        });

        // Add user to Firestore
        await db.collection('users').doc(userRecord.uid).set({
            name: name,
            email: email,
            createdAt: new Date()
        });

        console.log('User registered successfully:', userRecord.uid);
        res.send('Registration successful!');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});

export default router;