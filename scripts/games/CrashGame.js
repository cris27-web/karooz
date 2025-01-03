
export class CrashGame {
    constructor(updateBalance) {
        this.multiplier = 1.00;
        this.isRunning = false;
        this.updateBalance = updateBalance;
        this.currentBet = 0;
        this.crashPoint = 0;
    }

    start(betAmount) {
        if (this.isRunning) return;
        
        this.currentBet = betAmount;
        this.isRunning = true;
        this.multiplier = 1.00;
        this.crashPoint = this.generateCrashPoint();
        
        return this.runGame();
    }

    generateCrashPoint() {
        return Math.floor(Math.random() * 300 + 100) / 100; // Between 1.00x and 4.00x
    }

    cashOut() {
        if (!this.isRunning) return 0;
        
        const winnings = Math.floor(this.currentBet * this.multiplier);
        this.isRunning = false;
        this.updateBalance(winnings);
        return winnings;
    }

    runGame() {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (!this.isRunning) {
                    clearInterval(interval);
                    resolve(0);
                    return;
                }

                this.multiplier += 0.01;
                
                if (this.multiplier >= this.crashPoint) {
                    this.isRunning = false;
                    clearInterval(interval);
                    resolve(-this.currentBet);
                }
            }, 100);
        });
    }
}