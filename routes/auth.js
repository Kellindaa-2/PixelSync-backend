// Cleaned auth routes - single implementation
import nodemailer from 'nodemailer';
import express from 'express';
import { admin, db } from '../firebase/firebaseAdmin.js';

const allowedCunyDomains = [
  'cuny.edu',
  'login.cuny.edu',
  'citymail.cuny.edu',
  'baruch.cuny.edu',
  'brooklyn.cuny.edu',
  'mail.citytech.cuny.edu',
  'collegeofstatenisland.cuny.edu',
  'lehman.cuny.edu',
  'medgar.evers.cuny.edu',
  'newschool.cuny.edu',
  'queensborough.cuny.edu',
  'queens.cuny.edu',
  'hostos.cuny.edu',
  'kingsborough.cuny.edu',
  'la.guardian.cuny.edu',
  'jjay.cuny.edu',
  'guttman.cuny.edu',
  'stu.bmcc.cuny.edu',
  'myhunter.cuny.edu'
];

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isValidCunyEmail(email) {
  return allowedCunyDomains.some(domain => email.toLowerCase().endsWith(`@${domain}`));
}

const router = express.Router();

export const authenticateFirebaseToken = async (req, res, next) => {
  const idToken = req.cookies?.authToken || req.headers.authorization?.split('Bearer ')[1] || req.body?.idToken;
  if (!idToken) return res.status(401).send('No token provided');

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification failed:', error?.message || error);
    res.status(401).send('Invalid token');
  }
};

router.get('/login', (req, res) => {
  res.render('auth', { FormType: 'login', layout: false });
});

router.get('/register', (req, res) => {
  res.render('auth', { FormType: 'register', layout: false });
});

router.post('/login', async (req, res) => {
  const idToken = req.cookies?.authToken || req.headers.authorization?.split('Bearer ')[1] || req.body?.idToken;
  if (!idToken) return res.status(401).json({ error: 'No token provided' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        name: decodedToken.name || decodedToken.display_name || 'User',
        email: decodedToken.email,
        createdAt: new Date(),
        lastLogin: new Date(),
        verified: !!decodedToken.email_verified
      });
    } else {
      await userRef.update({ lastLogin: new Date() });
    }

    const fresh = await userRef.get();
    const userData = fresh.data();

    if (!userData?.verified) return res.status(403).json({ error: 'Email not verified' });

    res.cookie('authToken', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({ success: true, message: 'Login successful', user: { uid, email: decodedToken.email, name: userData.name } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid token or authentication failed' });
  }
});

router.post('/register', async (req, res) => {
  const idToken = req.cookies?.authToken || req.headers.authorization?.split('Bearer ')[1] || req.body?.idToken;
  if (!idToken) return res.status(401).json({ error: 'No token provided' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const { name, email } = req.body;

    if (!email || !isValidCunyEmail(email)) return res.status(400).json({ error: 'Please provide a valid CUNY school email.' });

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (userDoc.exists) return res.status(400).json({ error: 'User already exists' });

    const verificationCode = generateVerificationCode();

    await userRef.set({
      name,
      email,
      verified: false,
      verificationCode,
      verificationExpires: Date.now() + 10 * 60 * 1000,
      createdAt: new Date(),
      lastLogin: new Date()
    });

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await transporter.sendMail({
          from: `"Your App" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Verify Your CUNY Email',
          text: `Hello ${name},\n\nYour verification code is: ${verificationCode}\n\nThis code expires in 10 minutes.`
        });
      } catch (mailErr) {
        console.error('Failed to send verification email:', mailErr);
      }
    }

    res.json({ success: true, message: `Verification code sent to ${email}`, user: { uid, email, name } });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
});

router.post('/verify-email', async (req, res) => {
  const { uid, code } = req.body;
  if (!uid || !code) return res.status(400).json({ error: 'uid and code are required' });

  try {
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return res.status(400).json({ error: 'Invalid user' });

    const data = userDoc.data();
    if (data.verified) return res.status(400).json({ error: 'Email already verified' });
    if (Date.now() > (data.verificationExpires || 0)) return res.status(400).json({ error: 'Verification code expired' });
    if (data.verificationCode !== code) return res.status(400).json({ error: 'Invalid verification code' });

    await userRef.update({ verified: true, verificationCode: null, verificationExpires: null });
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Error verifying email' });
  }
});

// Check if user is authenticated
router.get('/check-auth', async (req, res) => {
  const idToken = req.cookies?.authToken || req.headers.authorization?.split('Bearer ')[1] || req.body?.idToken;
  if (!idToken) return res.status(401).json({ authenticated: false });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists) return res.status(401).json({ authenticated: false });

    res.json({ authenticated: true, user: { uid: decodedToken.uid, email: decodedToken.email, name: userDoc.data().name } });
  } catch (error) {
    res.status(401).json({ authenticated: false });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.redirect('/auth/login');
});

export default router;