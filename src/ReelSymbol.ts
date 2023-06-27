import Phaser from "phaser"

export class ReelSymbol extends Phaser.GameObjects.Image {
    public threevalue: number
    public fourvalue: number
    public key: string


    
    constructor(scene: Phaser.Scene, x: number, y: number, key: string, threevalue: number,fourvalue: number) {
        super(scene, x, y, key)
        this.key = key
        this.threevalue = threevalue
        this.fourvalue = fourvalue
        this.scene.add.existing(this)
    }

    getValue() {
        return this.threevalue
        return this.fourvalue
    }

    onWin() {
        
    }

    onSpin() {
        
    }

    
    

    
}