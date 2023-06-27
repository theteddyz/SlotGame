import Phaser from "phaser"
import { Reel } from "./reel"
import { outcomeController } from "./outcomeController"
import { symbolData } from './SymbolData'

class MainScene extends Phaser.Scene {
    private reel: Reel[] = []
    private outcomeController: outcomeController
    private outcomeText: Phaser.GameObjects.Text
    private winlines: Phaser.GameObjects.Graphics
    private playerCredits: number = 100
    private betAmount: number = 10
    private finalwin: number = 0
    private creditText: Phaser.GameObjects.Text 
    private betText:Phaser.GameObjects.Text
    private winText:Phaser.GameObjects.Text
    private maxBetAmount: number = 200
    private winOutcome: [number, number][][] = []  
    private spinOutcome: { key: string, threevalue: number, fourvalue: number }[][]  

    constructor() {
        super({
            key: "MainScene"
        })
    }

    preload() {
        symbolData.forEach(symbol => {
            this.load.image(symbol.key, `assets/${symbol.key}.png`)
            this.load.image('spinButton', 'assets/spinButton.png')

        })
    }

    create() {
        const numReels = 4
        const reelGap = 50
        const reelWidth = 80
        const totalWidth = numReels * reelWidth + (numReels - 1) * reelGap
    
        for (let i = 0; i < numReels; i++) {
            let reel = new Reel(this, this.cameras.main.centerX - totalWidth / 2 + i * (reelWidth + reelGap), this.cameras.main.centerY - reelWidth / 2)
            this.reel.push(reel)
        }
    
        this.creditText = this.add.text(10, 50, `Credits: ${this.playerCredits}`, { font: '20px Arial', color: '#ffffff' })
        this.betText = this.add.text(10, 70, `Bet Amount: ${this.betAmount}`, { font: '20px Arial', color: '#ffffff' })
        this.winText = this.add.text(10, 90, `Last Win: ${this.finalwin}`, { font: '20px Arial', color: '#ffffff' })
        this.outcomeController = new outcomeController(symbolData)
        this.outcomeText = this.add.text(10, 10, '', { font: '20px Arial', color: '#ffffff' })
        
        const spinButton = this.add.image(this.cameras.main.centerX + 220, this.cameras.main.height - 100, 'spinButton').setInteractive().setName('spinButton')
        spinButton.setScale(.2)  
    
        
        this.winlines = this.add.graphics({ lineStyle: { color: 0x00ff00 } }) 
        spinButton.on('pointerdown', () => this.spinReels())
    
        const increaseBetButton = this.add.text(100, 650, 'Increase Bet', { font: '20px Arial', color: '#ffffff' }).setInteractive()
        increaseBetButton.on('pointerdown', () => {
            if (this.betAmount < this.maxBetAmount) {
                this.betAmount += 5
            }
            this.betText.setText(`Bet Amount: ${this.betAmount}`)
        })
    
        const decreaseBetButton = this.add.text(250, 650, 'Decrease Bet', { font: '20px Arial', color: '#ffffff' }).setInteractive()
        decreaseBetButton.on('pointerdown', () => {
            this.betAmount = Math.max(this.betAmount - 5, 5)
            this.betText.setText(`Bet Amount: ${this.betAmount}`)
        })
    }
    
    
    


    spinReels() {
        if (this.playerCredits < this.betAmount) {
            return
        }
        this.winlines.clear
        this.prepareToSpin()
        .then(() => this.spin())
        .then(outcome => this.checkOutcome(outcome))
        .then(winPositions => this.evaluateSpinOutcome(winPositions))
        .then(() => this.endSpin())
        .catch(error => console.error(error))
    }



    prepareToSpin() {
        return new Promise<void>((resolve) => {                
            const spinButton = this.children.getByName('spinButton') as Phaser.GameObjects.Image
            spinButton.disableInteractive()
            this.winlines.clear()
            this.outcomeText.visible = false
            this.playerCredits -= this.betAmount
            this.creditText.setText(`Credits: ${this.playerCredits}`)
            resolve()
        })
    }


    async spin() {
        let outcome = this.outcomeController.generateOutcome(4, 3)
    
        console.log('Generated outcome:', outcome)
        this.spinOutcome = outcome
    
        let spinPromises: Promise<void>[] = []
    
        for (let index = 0; index < this.reel.length; index++) {
            console.log(`Setting symbols for reel ${index}:`, outcome[index])
            this.reel[index].setSymbols(outcome[index].map(symbol => symbol.key))
    
            const stopDelay = index * 4 
            let spinPromise = this.reel[index].spin(stopDelay)
            spinPromises.push(spinPromise)
        }
    
        for (let spinPromise of spinPromises) {
            await spinPromise
        }
    
        return outcome
    }


    checkOutcome(outcome) {
        console.log('Checking outcome:', outcome)
        this.winOutcome = this.checkWin(outcome)
        console.log('Win outcome:', this.winOutcome)
        return Promise.resolve(this.winOutcome)
    }


    checkWin(outcome: { key: string, threevalue: number, fourvalue: number}[][]): [number, number][][] {
        if (!outcome || !Array.isArray(outcome) || !outcome[0] || !Array.isArray(outcome[0])) {
            console.error('Invalid outcome:', outcome)
            return []
        }
    
        let winPositions: [number, number][][] = []
        let checkSymbol = (symbolKey: string, symbol: { key: string, threevalue: number, fourvalue: number }) => 
            symbol.key === symbolKey || symbol.key === 'wild'
    
        for (let i = 0; i < outcome[0].length; i++) {
            for (let j = 0; j < outcome[1].length; j++) {
                if (checkSymbol(outcome[0][i].key, outcome[1][j])) {
                    for (let k = 0; k < outcome[2].length; k++) {
                        if (checkSymbol(outcome[0][i].key, outcome[2][k])) {
                            winPositions.push([[0, i], [1, j], [2, k]]);
                            for (let l = 0; l < outcome[3].length; l++) {
                                if (checkSymbol(outcome[0][i].key, outcome[3][l])) {
                                    winPositions.push([[0, i], [1, j], [2, k], [3, l]]);
                                }
                            }
                        }
                    }
                }
            }
        }
        return winPositions
    }

    calculateLineWins(winPositions: [number, number][][]): number[] {
        return winPositions.map(winLine => {
            let nonWildSymbolKey = this.getFirstNonWildSymbolKey(winLine)
            let winningSymbol = symbolData.find(symbol => symbol.key === nonWildSymbolKey)
            return this.calculateSingleLineWin(winningSymbol || {key: '', threevalue: 0, fourvalue: 0}, winLine)
        })
    }


    getFirstNonWildSymbolKey(winLine: [number, number][]) {
        for (let [reelIndex, symbolIndex] of winLine) {
            let symbolKey = this.reel[reelIndex].symbols[symbolIndex].key
            if (symbolKey !== 'wild') {
                return symbolKey
            }
        }
        return ''
    }


    calculateSingleLineWin(winningSymbol: { key: string, threevalue: number, fourvalue: number }, winLine: [number, number][]): number {
        let lineWin = this.betAmount * winningSymbol.threevalue
        if (winLine.length === 4) {
            lineWin = this.betAmount * winningSymbol.fourvalue
        }
        if (this.containsWild(winLine)) {
            return lineWin * 2
        }
        return lineWin
    }
    
    

    containsWild(winLine: [number, number][]) {
        return winLine.some(([i, j]) => this.reel[i].symbols[j].key === 'wild')
    }
    

    

        setReelsToDefaultPosition() {
            this.reel.forEach((reel: Reel) => {
                reel.setToDefaultPosition()
            })
        }


    evaluateSpinOutcome(winPositions) {
        return new Promise<void>((resolve) => { 
            if (winPositions.length > 0) {
                this.calculateWinAndDisplayResult(this.spinOutcome, this.children.getByName('spinButton') as Phaser.GameObjects.Image)  
                resolve()  
            } else {
                resolve()
            }
        })
    }

    calculateWinAndDisplayResult(outcome: { key: string, threevalue: number, fourvalue: number }[][], spinButton: Phaser.GameObjects.Image) {
        let winPositions = this.checkWin(outcome)
        if (winPositions.length > 0) {
            this.finalwin = 0
            let lineWins = this.calculateLineWins(winPositions)
            let totalWin = lineWins.reduce((a, b) => a + b, 0)
            this.playerCredits += totalWin
            this.finalwin += totalWin
            this.creditText.setText(`Credits: ${this.playerCredits}`)
            this.winText.setText(`Last Win: ${this.finalwin}`)
            this.showWinText(totalWin)
            this.time.delayedCall(500, () => {
                winPositions.forEach(winLine => {
                    this.drawLine(winLine)
                })
            })
        }
        
    }
    

    

        

        endSpin() {
            return new Promise<void>((resolve) => {
                const spinButton = this.children.getByName('spinButton') as Phaser.GameObjects.Image
                setTimeout(() => {
                    spinButton.setInteractive()
                    resolve()
                }, 500)
            })
        }
        

        showWinText(totalWin: number) {
            let winText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 50, '', { font: '40px Arial', color: '#ff0000' })
            winText.setOrigin(0.5)
            winText.setAlpha(0)
    
            let text = totalWin > 400 ? `BIG WIN: ${totalWin}` : `Win: ${totalWin}`
            winText.setText(text)
            
    
            let repeatTimes = totalWin > 400 ? 2 : 3
            this.tweens.add({
                targets: winText,
                alpha: 1,
                duration: 500,
                yoyo: true,
                repeat: repeatTimes,
                onComplete: () => winText.destroy()
            })
        }  
    
    drawLine(winPositions: [number, number][]) {

        this.winlines.lineStyle(5, 0xff0000)
        const offsetX = -37
        const offsetY = -30
        for (let i = 0; i < winPositions.length; i++) {
            let [reelIndex, symbolIndex] = winPositions[i]
            let reel = this.reel[reelIndex]
            let symbol = reel.symbols[symbolIndex]

            
            let symbolCenterX = reel.x + symbol.x + symbol.displayWidth / 2 + offsetX
            let symbolCenterY = reel.y + symbol.y + symbol.displayHeight / 2 + offsetY

            if (i === 0) {
                this.winlines.moveTo(symbolCenterX, symbolCenterY)
            } else {
                this.winlines.lineTo(symbolCenterX, symbolCenterY)
            }
        }
        this.winlines.strokePath()
    }

    update() {
        let reelsSpinning = false
    
        for (let reel of this.reel) {
            reel.update()
    
           
            if (reel.isSpinning) {
                reelsSpinning = true
            }
        }
    }
   
    
    
    
}
export default MainScene