import Phaser from "phaser"
export class outcomeController {
    private weightedSymbols: { key: string, threevalue: number, fourvalue: number, spawnChance:number }[] = []

    constructor(symbols: { key: string, threevalue: number, fourvalue: number, spawnChance:number }[]) {
        symbols.forEach(symbol => {
            
            const weight = Math.round(100 / symbol.spawnChance)

          
            for (let i = 0; i < weight; i++) {
                this.weightedSymbols.push(symbol)
            }
        })
    }

    generateOutcome(reelCount: number, symbolCount: number): { key: string, threevalue: number, fourvalue:number }[][] {
        let outcome: { key: string, threevalue: number, fourvalue: number }[][] = []
    
        for (let i = 0; i < reelCount; i++) {
            let reelOutcome: { key: string, threevalue: number, fourvalue: number }[] = []
            for (let j = 0; j < symbolCount; j++) {
                let symbolIndex = Phaser.Math.Between(0, this.weightedSymbols.length - 1)
                let symbol = this.weightedSymbols[symbolIndex]
                reelOutcome.push({ key: symbol.key, threevalue: symbol.threevalue, fourvalue: symbol.fourvalue })  // exclude spawnChance
            }
            outcome.push(reelOutcome)
        }
    
        console.log("Generated outcome: ", outcome)
        return outcome
    }
    
}