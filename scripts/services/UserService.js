import { firebaseApp } from '../firebaseConfig.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth-compat.js';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js';

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export class UserService {
    constructor() {
        this.currentUser = null;
    }

    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            this.currentUser = userCredential.user;
            return true;
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please check your credentials.');
            return false;
        }
    }

    async register(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            this.currentUser = userCredential.user;
            // Create user profile in Firestore
            await setDoc(doc(db, 'users', this.currentUser.uid), {
                username: email,
                coins: 1000,
                lastBonus: new Date(),
                inventory: [],
                stats: {
                    wins: 0,
                    losses: 0,
                    biggestWin: 0
                }
            });
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed. Please try again.');
            return false;
        }
    }

    async logout() {
        try {
            await signOut(auth);
            this.currentUser = null;
        } catch (error) {
            console.error('Logout error:', error);
            alert('Logout failed.');
        }
    }

    async getUserData() {
        if (!this.currentUser) return null;
        const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    }

    async updateCoins(amount) {
        if (!this.currentUser) return;
        const userRef = doc(db, 'users', this.currentUser.uid);
        const userData = await this.getUserData();
        await updateDoc(userRef, {
            coins: userData.coins + amount
        });
    }

    async claimDailyBonus() {
        if (!this.currentUser) return false;
        const userRef = doc(db, 'users', this.currentUser.uid);
        const userData = await this.getUserData();
        const lastBonus = userData.lastBonus.toDate();
        const now = new Date();
        const hoursDiff = (now - lastBonus) / (1000 * 60 * 60);
        if (hoursDiff >= 24) {
            await updateDoc(userRef, {
                coins: userData.coins + 100,
                lastBonus: now
            });
            return true;
        }
        return false;
    }

    async getStats() {
        if (!this.currentUser) return null;
        const userData = await this.getUserData();
        return userData.stats;
    }

    async updateStats(win, amount) {
        if (!this.currentUser) return;
        const userRef = doc(db, 'users', this.currentUser.uid);
        const userData = await this.getUserData();
        let { wins, losses, biggestWin } = userData.stats;
        if (win) {
            wins += 1;
            if (amount > biggestWin) biggestWin = amount;
        } else {
            losses += 1;
        }
        await updateDoc(userRef, {
            'stats.wins': wins,
            'stats.losses': losses,
            'stats.biggestWin': biggestWin
        });
    }
}
