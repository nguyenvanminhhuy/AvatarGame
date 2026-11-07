import './style.css'
import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { PlayScene } from './scenes/PlayScene'

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: 640,
  height: 360,
  pixelArt: true,
  backgroundColor: '#2d6a4f',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, PlayScene],
})
