import { UserService } from './services/UserService.js';
import { initializeFirebase } from './firebaseConfig.js';
import { CrashGame } from './games/CrashGame.js';

// Initialize Firebase
initializeFirebase();

const userService = new UserService();

// Initialize UI elements
const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const submitLogin = document.getElementById('submitLogin');
const registerBtn = document.getElementById('registerBtn');
const usernameSpan = document.getElementById('username');
const userCoins = document.getElementById('userCoins');
const claimBonus = document.getElementById('claimBonus');
const spinBtn = document.getElementById('spinBtn');
const crashBetBtn = document.getElementById('crashBetBtn');
const crashCashoutBtn = document.getElementById('crashCashoutBtn');
const crashMultiplierEl = document.getElementById('crashMultiplier');
const shopBtn = document.getElementById('shopBtn');
const shopModal = document.getElementById('shopModal');
const closeShopBtn = document.getElementById('closeShop');
const shopItemsContainer = document.querySelector('.shop-items');

// Initialize Crash Game
const crashGame = new CrashGame((amount) => {
    userService.updateCoins(amount);
    updateUI();
});

// Event Listeners
loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
});

submitLogin.addEventListener('click', async () => {
    const email = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;

    if (await userService.login(email, password)) {
        loginModal.style.display = 'none';
        updateUI();
    }
});

registerBtn.addEventListener('click', async () => {
    const email = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;

    if (await userService.register(email, password)) {
        loginModal.style.display = 'none';
        updateUI();
    }
});

claimBonus.addEventListener('click', async () => {
    if (await userService.claimDailyBonus()) {
        updateUI();
        alert('Claimed 100 coins!');
    } else {
        alert('You already claimed your bonus today!');
    }
});

spinBtn.addEventListener('click', () => {
    if (userService.currentUser) {
        playSlotMachine();
    } else {
        alert('Please log in to play.');
    }
});

crashBetBtn.addEventListener('click', async () => {
    const betAmount = parseInt(document.getElementById('crashBetAmount').value);
    const user = userService.currentUser;

    if (user && userService.getUserData().then(data => data.coins >= betAmount)) {
        await userService.updateCoins(-betAmount);
        updateUI();

        const result = await crashGame.start(betAmount);
        if (result > 0) {
            showWinAnimation(result);
            await userService.updateStats(true, result);
        } else {
            showLossAnimation();
            await userService.updateStats(false, 0);
        }
        updateUI();
    } else {
        alert('Not enough coins!');
    }
});

crashCashoutBtn.addEventListener('click', () => {
    const winnings = crashGame.cashOut();
    if (winnings > 0) {
        showWinAnimation(winnings);
        userService.updateCoins(winnings);
        updateUI();
    }
});

shopBtn.addEventListener('click', () => {
    loadShopItems();
    shopModal.style.display = 'block';
});

closeShopBtn.addEventListener('click', () => {
    shopModal.style.display = 'none';
});

// Slot Machine Functionality
async function playSlotMachine() {
    const userData = await userService.getUserData();
    if (userData.coins < 50) {
        alert('Not enough coins!');
        return;
    }

    await userService.updateCoins(-50);
    updateUI();

    const symbols = gameService.playSlots();
    displaySlotResults(symbols);

    if (gameService.calculateWinnings(symbols) > 0) {
        const winnings = gameService.calculateWinnings(symbols);
        await userService.updateCoins(winnings);
        await userService.updateStats(true, winnings);
        showWinAnimation(winnings);
    } else {
        await userService.updateStats(false, 0);
        showLossAnimation();
    }
    updateUI();
}

// Display Slot Results
function displaySlotResults(symbols) {
    const slotElements = document.querySelectorAll('.slots div');
    slotElements.forEach((slot, index) => {
        slot.textContent = symbols[index];
    });
}

// Show Win Animation
function showWinAnimation(amount) {
    const winPopup = document.createElement('div');
    winPopup.className = 'win-popup win-animation';
    winPopup.textContent = `+${amount} coins!`;
    document.body.appendChild(winPopup);
    setTimeout(() => winPopup.remove(), 1500);
}

// Show Loss Animation
function showLossAnimation() {
    const lossPopup = document.createElement('div');
    lossPopup.className = 'loss-popup win-animation';
    lossPopup.textContent = `You lost!`;
    document.body.appendChild(lossPopup);
    setTimeout(() => lossPopup.remove(), 1500);
}

// Update UI Function
async function updateUI() {
    if (userService.currentUser) {
        usernameSpan.textContent = userService.currentUser.email;
        const userData = await userService.getUserData();
        userCoins.textContent = `Coins: ${userData.coins}`;
        loginBtn.style.display = 'none';
    } else {
        usernameSpan.textContent = 'Not logged in';
        userCoins.textContent = 'Coins: 0';
        loginBtn.style.display = 'block';
    }

    // Update Statistics
    const stats = await userService.getStats();
    if (stats) {
        document.getElementById('totalWins').textContent = stats.wins;
        document.getElementById('totalLosses').textContent = stats.losses;
        document.getElementById('biggestWin').textContent = stats.biggestWin;
    }
}

// Load Shop Items
function loadShopItems() {
    const items = [
        { id: 'item1', name: 'Lucky Charm', price: 500 },
        { id: 'item2', name: 'VIP Status', price: 1000 },
        { id: 'item3', name: 'Special Avatar', price: 750 }
    ];

    shopItemsContainer.innerHTML = '';
    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'shop-item';
        itemDiv.innerHTML = `
            <span>${item.name} - ${item.price} coins</span>
            <button onclick="purchaseItem('${item.id}', ${item.price})">Buy</button>
        `;
        shopItemsContainer.appendChild(itemDiv);
    });
}

// Purchase Shop Item
window.purchaseItem = async function(id, price) {
    const userData = await userService.getUserData();
    if (userData.coins < price) {
        alert('Not enough coins!');
        return;
    }

    await userService.updateCoins(-price);
    const userRef = doc(db, 'users', userService.currentUser.uid);
    await updateDoc(userRef, {
        inventory: [...userData.inventory, id]
    });

    alert('Item purchased!');
    updateUI();
}

// Initialize App on Load
window.onload = () => {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            userService.currentUser = user;
            await updateUI();
        } else {
            userService.currentUser = null;
            updateUI();
        }
    });
};

// Game Service
const gameService = {
    symbols: ['🍒', '🍊', '🍇', '💎', '7️⃣'],
    playSlots: function() {
        const symbols = [];
        for (let i = 0; i < 3; i++) {
            const randomSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
            symbols.push(randomSymbol);
        }
        return symbols;
    },
    calculateWinnings: function(symbols) {
        if (symbols.every(s => s === symbols[0])) {
            return symbols[0] === '7️⃣' ? 500 : 200;
        } else if (symbols[0] === symbols[1] || symbols[1] === symbols[2]) {
            return 50;
        }
        return 0;
    }
};
