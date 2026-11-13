import './style.css'
import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { PlayScene } from './scenes/PlayScene'
import { TitleScene } from './scenes/TitleScene'

// Phong cách cartoon mượt: KHÔNG bật pixelArt (cần làm mịn khi thu phóng).
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: 960,
  height: 544,
  backgroundColor: '#1b1b1b',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, TitleScene, PlayScene],
})

// Chỉ ở chế độ dev: cho phép công cụ kiểm thử/DevTools truy cập game (không có trong bản build).
if (import.meta.env.DEV) (window as unknown as { __game: Phaser.Game }).__game = game
