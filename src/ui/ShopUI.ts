import Phaser from 'phaser'
import { TAB_NINE, TAB_OFF_H, TAB_ON_H, kitButton, kitNine } from './kit.ts'

// Bảng cửa hàng / nhà kho theo ảnh tham khảo: cửa sổ khung gỗ, hàng tab phía trên, lưới ô vật phẩm,
// phần chi tiết bên dưới và nút vàng (Mua / Bán / ...). Chỉ vẽ và báo sự kiện bấm; mọi số liệu và logic
// do PlayScene dựng thành ShopModel (xem PlayScene.shopModel) nên không có luật chơi nào nằm ở đây.
export interface ShopCard {
  icon: string // khóa texture
  badge?: string // số nhỏ ở góc ô (số lượng)
  dim?: boolean // ô chưa mở khóa
}
export interface ShopModel {
  tabs: Array<{ id: string; label: string }>
  tab: string
  cards: ShopCard[]
  selected: number
  lines: string[] // dòng đầu in đậm
  buttons: Array<{ label: string; enabled: boolean }>
  note: string
  focus: 'tabs' | 'grid' // bàn phím đang ở hàng tab hay ở lưới vật phẩm
  hint: string // dòng hướng dẫn phím ở đáy cửa sổ
}
export interface ShopCallbacks {
  onTab: (id: string) => void
  onCard: (i: number) => void
  onButton: (i: number) => void
  onClose: () => void
}

const W = 420
const BASE_H = 240 // phần ngoài lưới: lề trên, chi tiết, ghi chú, hướng dẫn phím
const COLS = 6
const PAGE = COLS * 3 // số ô hiện cùng lúc; nhiều hơn thì chia trang theo ô đang chọn
const CELL = 56
const GAP = 6
const TEXT = '#5a2d0c'
const DEPTH = 10010

export class ShopUI {
  private box: Phaser.GameObjects.Container
  private sig = ''
  private scene: Phaser.Scene
  private cb: ShopCallbacks

  constructor(scene: Phaser.Scene, cb: ShopCallbacks) {
    this.scene = scene
    this.cb = cb
    this.box = scene.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH).setVisible(false)
  }

  get visible() {
    return this.box.visible
  }

  hide() {
    this.box.setVisible(false)
    this.sig = ''
  }

  render(m: ShopModel) {
    const sig = JSON.stringify(m)
    if (sig === this.sig && this.box.visible) return
    this.sig = sig
    this.box.removeAll(true)
    this.box.setVisible(true)

    const s = this.scene
    const x0 = Math.round((s.scale.width - W) / 2)
    const y0 = 88
    const rows = Math.min(3, Math.max(2, Math.ceil(m.cards.length / COLS)))
    const pages = Math.max(1, Math.ceil(m.cards.length / PAGE))
    const padTop = pages > 1 ? 12 : 0 // chỗ cho dòng "Trang x/y" phía trên lưới
    const H = BASE_H + padTop + rows * (CELL + GAP)
    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
      this.box.add(o)
      return o
    }
    const text = (x: number, y: number, t: string, size: number, bold = false, color = TEXT) =>
      add(s.add.text(x, y, t, { fontFamily: 'sans-serif', fontSize: `${size}px`, fontStyle: bold ? 'bold' : 'normal', color }))

    // Chặn bấm xuyên xuống màn chơi.
    add(s.add.rectangle(0, 0, s.scale.width, s.scale.height, 0x000000, 0.25).setOrigin(0).setInteractive())

    // Tab: tab chưa chọn nằm sau cửa sổ, tab đang chọn nằm trước.
    const tabW = Math.min(78, (W - 28) / m.tabs.length)
    const tabX = (i: number) => x0 + 14 + i * tabW
    // Mọi tab cùng kích thước và cùng hàng; chỉ khác ảnh nền (chưa chọn / đang chọn).
    const tabOffY = y0 - 10 // đáy tab cách y0 + 10 (px màn hình): tab chưa chọn cao 40, tab đang chọn cao 48 nhô cao hơn
    const tabOnY = y0 - 14
    const tabY = tabOnY
    m.tabs.forEach((t, i) => {
      if (t.id === m.tab) return
      const img = add(kitNine(s, tabX(i) + tabW / 2, tabOffY, tabW - 4, TAB_OFF_H, 'kit_tab_off', TAB_NINE))
      img.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.cb.onTab(t.id))
    })
    // Khung cửa sổ: nine-slice vẽ gấp đôi rồi thu nhỏ một nửa để viền mảnh như ảnh.
    const win = s.add.nineslice(x0 + W / 2, y0 + H / 2, 'hub_shop_window', undefined, W * 2, H * 2, 36, 36, 36, 36)
    win.setScale(0.5)
    add(win)
    m.tabs.forEach((t, i) => {
      const on = t.id === m.tab
      if (on) add(kitNine(s, tabX(i) + tabW / 2, tabOnY, tabW - 4, TAB_ON_H, 'kit_tab_on', TAB_NINE))
      text(tabX(i) + tabW / 2, (on ? tabOnY : tabOffY) + 1, t.label, 13, on, on ? '#ffffff' : TEXT).setOrigin(0.5)
      // Bàn phím đang ở hàng tab: mũi tên vàng chỉ vào tab đang chọn.
      if (on && m.focus === 'tabs') add(s.add.image(tabX(i) + tabW / 2, tabY - 28, 'ui_arrow_down_yellow').setDisplaySize(22, 22))
    })

    // Nút đóng ở góc trên-phải cửa sổ.
    add(s.add.image(x0 + W - 4, y0 + 4, 'kit_btn_close').setDisplaySize(32, 32))
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.cb.onClose())

    // Lưới ô vật phẩm.
    const gx = x0 + Math.round((W - (COLS * CELL + (COLS - 1) * GAP)) / 2)
    const gy = y0 + 26 + padTop
    const page = Math.min(pages - 1, Math.floor(Math.max(0, m.selected) / PAGE))
    const off = page * PAGE
    if (pages > 1) text(x0 + W / 2, y0 + 17, `Trang ${page + 1}/${pages}  (↓ ↑ để qua trang)`, 11, false, "#7a5a3a").setOrigin(0.5, 0)
    m.cards.slice(off, off + PAGE).forEach((c, i) => {
      const x = gx + (i % COLS) * (CELL + GAP)
      const y = gy + Math.floor(i / COLS) * (CELL + GAP)
      const on = off + i === m.selected && m.focus === 'grid'
      const card = add(s.add.image(x + CELL / 2, y + CELL / 2, on ? 'hub_item_card_selected' : 'hub_item_card').setDisplaySize(CELL, CELL))
      card.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.cb.onCard(off + i))
      if (s.textures.exists(c.icon)) add(s.add.image(x + CELL / 2, y + CELL / 2 - 1, c.icon).setDisplaySize(40, 40).setAlpha(c.dim ? 0.35 : 1))
      if (c.badge) {
        const b = text(x + CELL - 5, y + 3, c.badge, 12, true, '#7a3a0c').setOrigin(1, 0)
        b.setStroke('#fff3d6', 3)
      }
    })

    // Chi tiết vật phẩm đang chọn.
    const dy = y0 + 26 + padTop + rows * (CELL + GAP) + 10
    m.lines.slice(0, 4).forEach((l, i) => text(x0 + 28, dy + (i === 0 ? 0 : 6 + i * 20), l, i === 0 ? 17 : 14, i === 0))

    // Nút vàng bên phải.
    m.buttons.slice(0, 2).forEach((b, i) => {
      const bx = x0 + W - 28 - 56
      const by = dy + 16 + i * 44
      const img = add(kitButton(s, bx, by, 116, b.enabled ? 'gold' : 'grey'))
      text(bx, by - 1, b.label, 15, true, b.enabled ? '#5a2d0c' : '#8a7a68').setOrigin(0.5)
      if (b.enabled) img.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.cb.onButton(i))
      else img.setInteractive().on('pointerdown', () => this.cb.onButton(i))
    })

    if (m.note) text(x0 + W / 2, y0 + H - 58, m.note, 13, true, '#8a3a12').setOrigin(0.5, 0)
    if (m.hint) {
      add(s.add.text(x0 + W / 2, y0 + H - 38, m.hint, { fontFamily: 'sans-serif', fontSize: '11px', color: '#7a5a3a', align: 'center', wordWrap: { width: W - 56 } }).setOrigin(0.5, 0))
    }
  }
}
