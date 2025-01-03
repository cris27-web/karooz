import express from 'express';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import adminRoutes from './routes/adminRoutes.js';
import adminConfig from './admin.js'; // Ensure admin.js initializes Firebase Admin SDK

const app = express();
const auth = getAuth();
const db = getFirestore();

// Middleware to check if the user is an admin
const isAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).send('Unauthorized');

    try {
        const user = await auth.verifyIdToken(token);
        if (user.admin) {
            next();
        } else {
            res.status(403).send('Forbidden');
        }
    } catch (error) {
        res.status(401).send('Unauthorized');
    }
};

// Route to get all users
app.get('/admin/users', isAdmin, async (req, res) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = usersSnapshot.docs.map(doc => doc.data());
        res.send(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to update user data
app.put('/admin/users/:uid', isAdmin, async (req, res) => {
    const { uid } = req.params;
    const userData = req.body;

    try {
        await db.collection('users').doc(uid).update(userData);
        res.send('User updated');
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to delete a user
app.delete('/admin/users/:uid', isAdmin, async (req, res) => {
    const { uid } = req.params;

    try {
        await db.collection('users').doc(uid).delete();
        res.send('User deleted');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to fetch top leaderboard entries
app.get('/leaderboard/top', async (req, res) => {
  try {
    const leaderboardSnapshot = await db.collection('leaderboards')
      .orderBy('score', 'desc')
      .limit(10)
      .get();
    const leaderboard = leaderboardSnapshot.docs.map(doc => doc.data());
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Mount admin routes
app.use('/admin', adminRoutes);

// Existing middleware and routes
app.use(express.json()); // To parse JSON bodies

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});