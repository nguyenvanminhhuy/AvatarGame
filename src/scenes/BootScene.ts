import Phaser from 'phaser'
import { ASSET_KEYS, ENV_CELL } from '../assets.gen'
import { registerAnimations } from '../art'
import { CROPS, ITEMS } from '../data/items'

export class BootScene extends Phaser.Scene {
  private failed: string[] = []

  constructor() {
    super('Boot')
  }

  preload() {
    this.failed = []
    const W = this.scale.width
    const H = this.scale.height
    const style = { fontFamily: 'sans-serif', fontSize: '18px', color: '#ffffff' }
    const label = this.add.text(W / 2, H / 2 - 30, 'Đang tải...', style).setOrigin(0.5)
    const frame = this.add.rectangle(W / 2, H / 2, 300, 18).setStrokeStyle(2, 0xffffff)
    const bar = this.add.rectangle(W / 2 - 148, H / 2, 0, 12, 0x7cc24f).setOrigin(0, 0.5)
    frame.setOrigin(0.5)

    this.load.on(Phaser.Loader.Events.PROGRESS, (v: number) => {
      bar.width = 296 * v
      label.setText(`Đang tải... ${Math.round(v * 100)}%`)
    })
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      this.failed.push(file.key)
      console.error('Không tải được asset:', file.key, file.url)
    })

    // Toàn bộ hình là pixel-art 4x do tools/import-art.mjs nhập từ art-source/ (pnpm art); danh sách khóa ở src/assets.gen.ts.
    this.load.spritesheet('env', 'assets/game/env.png', { frameWidth: ENV_CELL, frameHeight: ENV_CELL })
    for (const key of ASSET_KEYS) this.load.image(key, `assets/game/${key}.png`)
  }

  create() {
    // Có asset lỗi: báo rõ cho người chơi thay vì vào game thiếu hình hoặc sập.
    if (this.failed.length > 0) {
      this.add
        .text(
          this.scale.width / 2,
          this.scale.height / 2 + 30,
          `Không tải được: ${this.failed.join(', ')}\nHãy kiểm tra kết nối rồi tải lại trang (F5).`,
          { fontFamily: 'sans-serif', fontSize: '18px', color: '#ffb4b4', align: 'center' },
        )
        .setOrigin(0.5)
      return
    }
    this.bakeIcons()
    registerAnimations(this)
    // Mỗi vật phẩm trong catalog phải có icon; thiếu thì báo ngay lúc khởi động thay vì hiện ô trống trong game.
    const missing = [...Object.keys(ITEMS), 'coin'].filter((id) => !this.textures.exists(`icon-${id}`))
    if (missing.length > 0) console.error('Thiếu icon cho vật phẩm:', missing.join(', '))
    this.scene.start('Title')
  }

  // Icon ghép lúc khởi động: túi hạt giống + hình nông sản nhỏ; trứng vịt = trứng gà nhuộm xanh nhạt.
  private bakeIcons() {
    const img = (key: string) => this.textures.get(key).getSourceImage() as CanvasImageSource
    const seed = (key: string, crop: string) => {
      const tex = this.textures.createCanvas(key, 128, 128)!
      const ctx = tex.getContext()
      ctx.drawImage(img('seed_bag'), 0, 0, 128, 128)
      ctx.drawImage(img(crop), 0, 0, 128, 128, 62, 62, 64, 64)
      tex.refresh()
    }
    for (const [seedId, def] of Object.entries(CROPS)) seed(`icon-${seedId}`, `icon-${def.harvestItem}`)
    const tex = this.textures.createCanvas('icon-duck_egg', 128, 128)!
    const ctx = tex.getContext()
    ctx.drawImage(img('icon-egg'), 0, 0, 128, 128)
    ctx.globalCompositeOperation = 'source-atop'
    ctx.fillStyle = 'rgba(120,200,190,0.45)'
    ctx.fillRect(0, 0, 128, 128)
    tex.refresh()
  }
}
