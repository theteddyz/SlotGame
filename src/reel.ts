import Phaser from "phaser";
import { ReelSymbol } from './ReelSymbol';
import { symbolData } from './SymbolData'; // Add this import


export class Reel extends Phaser.GameObjects.Container {
    
    public symbols: ReelSymbol[] = [] 
    private speed: number = 0
    public spinTime: number = 0
    public isSpinning: boolean = false
    public newSymbols: string[] | null = ['symbol1', 'symbol2', 'symbol3']
    private initialSymbolPositions: { x: number, y: number }[] = []

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y)
        this.scene.add.existing(this)
    
        for (let i = 0; i < 3; i++) {
            let symbolDatum = Phaser.Math.RND.pick(symbolData)
            let symbol = new ReelSymbol(scene, 0, i * 100, symbolDatum.key, symbolDatum.threevalue, symbolDatum.fourvalue)
            symbol.setDisplaySize(80, 80)
            this.symbols.push(symbol)
            this.add(symbol)

            // Store the initial positions of the symbols
            this.initialSymbolPositions.push({ x: symbol.x, y: symbol.y })
        }
    }
    
    
        resetSymbols() {
            // Reset the symbols to their initial positions
            for (let i = 0; i < this.symbols.length; i++) {
                let symbol = this.symbols[i]
                let initialPosition = this.initialSymbolPositions[i]
                symbol.setPosition(initialPosition.x, initialPosition.y)
            }
        }
    
        setSymbols(symbolKeys: string[]) {
            this.newSymbols = symbolKeys
        
            
            if (this.newSymbols !== null) {
                for (let i = 0; i < this.symbols.length; i++) {
                    
                    if (this.newSymbols[i]) {
                        //@ts-ignore
                        let newSymbolData = symbolData.find(symbol => symbol.key === this.newSymbols[i])
                        
                        if (newSymbolData !== undefined) {
                            this.symbols[i].fourvalue = newSymbolData.fourvalue
                            this.symbols[i].threevalue = newSymbolData.threevalue
                            this.symbols[i].key = newSymbolData.key
                        }
                    }
                }
            }
        }

        
        
    
        spin(stopDelay: number = 0): Promise<void> {
            this.speed = 20;
            this.isSpinning = true;
        
            return new Promise<void>((resolve) => {
                this.spinTime = 6 + stopDelay;
                const spinInterval = setInterval(() => {
                    this.spinTime -= 1;
                    if (this.spinTime <= 0) {
                        this.speed = 0;
                        this.isSpinning = false;
                        this.setToDefaultPosition()
                        clearInterval(spinInterval);
                        resolve();
                    }
                }, 2000); 
            });
        }
        
        
        
        
        

        setToDefaultPosition() {
            
            this.symbols.forEach((symbol, index) => {
                const { x, y } = this.initialSymbolPositions[index]
                symbol.x = x
                symbol.y = y
            });

        }
    
        update() {
            if (this.spinTime > 0 && this.isSpinning) {
                for (let symbol of this.symbols) {
                    symbol.y += this.speed
                    if (symbol.y > 200) {
                       
                        symbol.y = -100
                        let randomSymbolData = Phaser.Math.RND.pick(symbolData)
                        if (randomSymbolData) {
                            symbol.setTexture(randomSymbolData.key)
                        }
                    }
                }
                this.spinTime -= 0.1
                if (this.spinTime <= 0) {
                    this.speed = 0
                    this.isSpinning = false
                    if (this.newSymbols) {
                        this.resetSymbols()
                        for (let i = 0; i < this.symbols.length; i++) {
                            this.symbols[i].setTexture(this.newSymbols[i])
                        }
                        this.newSymbols = null
                    }
                }
            }
        }
        
        
        
}