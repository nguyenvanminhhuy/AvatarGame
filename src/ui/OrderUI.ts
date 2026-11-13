import Phaser from 'phaser'
import { kitButton } from './kit.ts'

// Khung xem đơn hàng (thư / bảng tin): cùng kiểu khung gỗ với cửa hàng. Chỉ vẽ; số liệu do PlayScene dựng thành OrderModel.
export interface OrderRow {
  icon: string // khóa texture
  name: string
  have: number
  need: number
}
export interface OrderModel {
  title: string // tên đơn; rỗng khi đã xong mọi đơn
  rows: OrderRow[]
  reward: number // tiền thưởng (0: không hiện)
  note: string // dòng nhắc bên dưới
}

const W = 380
const ROW_H = 50
const TEXT = '#5a2d0c'
const DEPTH = 10010

export class OrderUI {
  private box: Phaser.GameObjects.Container
  private sig = ''
  private scene: Phaser.Scene
  private onClose: () => void

  constructor(scene: Phaser.Scene, onClose: () => void) {
    this.scene = scene
    this.onClose = onClose
    this.box = scene.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH).setVisible(false)
  }

  get visible() {
    return this.box.visible
  }

  hide() {
    this.box.setVisible(false)
    this.sig = ''
  }

  render(m: OrderModel) {
    const sig = JSON.stringify(m)
    if (sig === this.sig && this.box.visible) return
    this.sig = sig
    this.box.removeAll(true)
    this.box.setVisible(true)

    const s = this.scene
    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
      this.box.add(o)
      return o
    }
    const text = (x: number, y: number, t: string, size: number, bold = false, color = TEXT) =>
      add(s.add.text(x, y, t, { fontFamily: 'sans-serif', fontSize: `${size}px`, fontStyle: bold ? 'bold' : 'normal', color }))

    const done = m.title === ''
    const H = done ? 190 : 150 + m.rows.length * ROW_H + (m.reward > 0 ? 44 : 0) + 60
    const x0 = Math.round((s.scale.width - W) / 2)
    const y0 = Math.round((s.scale.height - H) / 2)

    add(s.add.rectangle(0, 0, s.scale.width, s.scale.height, 0x000000, 0.25).setOrigin(0)) // không chặn chuột: nút Xong của HUD vẫn bấm được
    const win = s.add.nineslice(x0 + W / 2, y0 + H / 2, 'hub_shop_window', undefined, W * 2, H * 2, 36, 36, 36, 36)
    win.setScale(0.5)
    add(win)
    add(s.add.image(x0 + W - 4, y0 + 4, 'kit_btn_close').setDisplaySize(32, 32))
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.onClose())

    text(x0 + W / 2, y0 + 30, 'ĐƠN HÀNG', 13, true, '#8a3a12').setOrigin(0.5, 0)
    if (done) {
      text(x0 + W / 2, y0 + 78, 'Bạn đã hoàn thành mọi đơn hàng hiện có!', 15, true).setOrigin(0.5, 0)
    } else {
      text(x0 + W / 2, y0 + 48, m.title, 20, true).setOrigin(0.5, 0)
      let y = y0 + 90
      for (const r of m.rows) {
        add(s.add.image(x0 + 52, y + 22, 'hub_item_card').setDisplaySize(44, 44))
        if (s.textures.exists(r.icon)) add(s.add.image(x0 + 52, y + 21, r.icon).setDisplaySize(32, 32))
        text(x0 + 84, y + 22, r.name, 16).setOrigin(0, 0.5)
        const ok = r.have >= r.need
        text(x0 + W - 52, y + 22, `${Math.min(r.have, 999)}/${r.need}`, 17, true, ok ? '#2f7a1f' : '#a33a12').setOrigin(1, 0.5)
        y += ROW_H
      }
      if (m.reward > 0) {
        y += 4
        add(s.add.image(x0 + 52, y + 18, 'icon-coin').setDisplaySize(30, 30))
        text(x0 + 84, y + 18, `Thưởng: ${m.reward} tiền`, 16, true, '#7a4a0c').setOrigin(0, 0.5)
        y += 40
      }
      text(x0 + W / 2, y + 6, m.note, 13, false, '#7a5a3a').setOrigin(0.5, 0)
    }
    const by = y0 + H - 44
    add(kitButton(s, x0 + W / 2, by, 116, 'gold'))
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.onClose())
    text(x0 + W / 2, by - 1, 'Xong', 15, true).setOrigin(0.5)
  }
}
