import Phaser from 'phaser'
import MainScene from './mainscene'

const config = {
	type: Phaser.AUTO,
	parent: 'app',
	width: window.innerWidth,
	height: window.innerHeight,
	physics: {
		default: 'arcade',
		arcade: {
			
		},
	},
	scene: [MainScene],
}
export default new Phaser.Game(config)

