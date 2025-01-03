import express from 'express';
import { auth, db } from '../admin.js';

const router = express.Router();

// Middleware to verify admin
const verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).send('Unauthorized');

  try {
    const decodedToken = await auth.verifyIdToken(token);
    if (decodedToken.admin !== true) {
      return res.status(403).send('Forbidden');
    }
    next();
  } catch (error) {
    return res.status(401).send('Unauthorized');
  }
};

// Endpoint to promote a user to admin
router.post('/promote', verifyAdmin, async (req, res) => {
  const { uid } = req.body;
  if (!uid) return res.status(400).send('User ID is required');

  try {
    await auth.setCustomUserClaims(uid, { admin: true });
    res.send('User promoted to admin');
  } catch (error) {
    console.error('Error promoting user:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to add a new shop item
router.post('/addShopItem', verifyAdmin, async (req, res) => {
  const { name, price, description } = req.body;
  if (!name || !price || !description) {
    return res.status(400).send('All fields are required');
  }

  try {
    const newItemRef = db.collection('shopItems').doc();
    await newItemRef.set({
      name,
      price,
      description
    });
    res.status(201).send('Shop item added successfully');
  } catch (error) {
    console.error('Error adding shop item:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to add a new leaderboard entry
router.post('/leaderboard/add', verifyAdmin, async (req, res) => {
  const { username, score } = req.body;
  if (!username || typeof score !== 'number') {
    return res.status(400).send('Username and score are required');
  }

  try {
    await db.collection('leaderboards').add({
      username,
      score,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(201).send('Leaderboard entry added successfully');
  } catch (error) {
    console.error('Error adding leaderboard entry:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;