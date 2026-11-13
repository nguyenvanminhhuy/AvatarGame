import Phaser from 'phaser'
import { kitButton } from './kit.ts'
import { CROPS, ITEMS } from '../data/items'

// Giao diện lấy cảm hứng từ ảnh tham khảo của chủ dự án: nút menu và nút thư ở góc trên-trái, tiền + giờ ở góc trên-phải,
// nút "Xong" màu vàng ở góc dưới-trái, túi đồ mở ra từ nút menu (phím I). Chỉ hiển thị + chuyển sự kiện bấm về PlayScene;
// mọi số liệu lấy từ GameState mỗi lần gọi update().
const SLOT = 52
const GAP = 4
const COLS = 9
const PAD = 10
const BORDER = 0x8a6a3f
const BORDER_SELECTED = 0xffd23f
const DEPTH = 10000
const PANEL_X = 12
const PANEL_Y = 76

export interface HudData {
  money: number
  inventory: Record<string, number>
  selectedSeed: string
  stock: string // "đã chứa/sức chứa" của kho
  day: number
  clock: string // "HH:MM"
  mailAlert: boolean // có đơn hàng đủ hàng để giao
  showDone: boolean // hiện nút "Xong" (đang mở bảng hoặc túi đồ)
}

export interface HudCallbacks {
  onMenu: () => void
  onMail: () => void
  onDone: () => void
  onPickSeed: (id: string) => void
}

type Fixed = Phaser.GameObjects.GameObject & { setScrollFactor(x: number): unknown; setDepth(d: number): unknown }

export class Hud {
  inventoryOpen = false
  private coinText: Phaser.GameObjects.Text
  private clockText: Phaser.GameObjects.Text
  private selectedText: Phaser.GameObjects.Text
  private slots: Array<{
    id: string
    frame: Phaser.GameObjects.Rectangle
    icon: Phaser.GameObjects.Image
    count: Phaser.GameObjects.Text
  }> = []
  private panelObjs: Phaser.GameObjects.GameObject[] = []
  private badge: Phaser.GameObjects.GameObject[] = []
  private doneObjs: Phaser.GameObjects.GameObject[] = []
  private chipObjs: Phaser.GameObjects.GameObject[] = []
  private chipIcon: Phaser.GameObjects.Image
  private chipText: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, cb: HudCallbacks) {
    const W = scene.scale.width
    const H = scene.scale.height
    const fix = <T extends Fixed>(o: T, depth = DEPTH): T => {
      o.setScrollFactor(0)
      o.setDepth(depth)
      return o
    }
    const label = { fontFamily: 'sans-serif', fontSize: '15px', color: '#ffffff', stroke: '#000000', strokeThickness: 3 }
    const roundRect = (x: number, y: number, w: number, h: number, r: number, fill: number, alpha: number, stroke?: number, sw = 2, depth = DEPTH) => {
      const g = fix(scene.add.graphics(), depth)
      g.fillStyle(fill, alpha)
      g.fillRoundedRect(x, y, w, h, r)
      if (stroke !== undefined) {
        g.lineStyle(sw, stroke, 1)
        g.strokeRoundedRect(x, y, w, h, r)
      }
      return g
    }
    const hit = (x: number, y: number, w: number, h: number, fn: () => void) => {
      const z = fix(scene.add.rectangle(x, y, w, h, 0xffffff, 0.001).setOrigin(0, 0), DEPTH + 5) as Phaser.GameObjects.Rectangle
      z.setInteractive({ useHandCursor: true }).on('pointerdown', fn)
      return z
    }

    // Nút menu (ba vạch xanh) mở túi đồ.
    const iconBtn = (x: number, key: string, fn: () => void) => {
      const img = fix(scene.add.image(x, 6, key).setOrigin(0, 0).setDisplaySize(72, 72)) // 24 px gốc x 3
      const z = hit(x + 4, 10, 64, 64, fn)
      z.on('pointerdown', () => img.setTexture(`${key}_pressed`))
      z.on('pointerup', () => img.setTexture(key))
      z.on('pointerout', () => img.setTexture(key))
    }
    iconBtn(10, 'kit_iconbtn_menu', cb.onMenu)

    // Nút thư: đơn hàng; dấu báo "!" khi có đơn đủ hàng để giao.
    iconBtn(88, 'kit_iconbtn_mail', cb.onMail)
    this.badge.push(fix(scene.add.image(146, 18, 'kit_badge_alert').setDisplaySize(27, 27), DEPTH + 1)) // 9 px gốc x 3

    // Tiền và ngày giờ ở góc trên-phải (khung viên thuốc nâu như ảnh tham khảo).
    const pill = (x: number, w: number) => fix(scene.add.image(x, 8, 'ui_hud_pill_frame').setOrigin(0, 0).setDisplaySize(w, 40))
    const coinX = W - 12 - 130
    pill(coinX, 130)
    fix(scene.add.image(coinX + 22, 28, 'icon-coin').setDisplaySize(28, 28))
    this.coinText = fix(scene.add.text(coinX + 44, 28, '0', { ...label, fontSize: '18px', fontStyle: 'bold', color: '#fff6c8' }).setOrigin(0, 0.5))
    const clockX = coinX - 8 - 158
    pill(clockX, 158)
    this.clockText = fix(scene.add.text(clockX + 79, 28, '', { ...label, color: '#cfe6ff' }).setOrigin(0.5))

    // Hạt đang chọn (luôn thấy dưới hai nút; Q để đổi).
    this.chipObjs.push(fix(scene.add.image(12, 82, 'ui_hud_pill_frame').setOrigin(0, 0).setDisplaySize(150, 32)))
    this.chipIcon = fix(scene.add.image(32, 97, 'icon-seed_carrot').setDisplaySize(22, 22))
    this.chipText = fix(scene.add.text(48, 97, '', { ...label, fontSize: '13px', color: '#ffe08a' }).setOrigin(0, 0.5))
    this.chipObjs.push(this.chipIcon, this.chipText)

    // Túi đồ: lưới ô vật phẩm, mở bằng nút menu hoặc phím I.
    const ids = Object.keys(ITEMS)
    const rows = Math.ceil(ids.length / COLS)
    const pw = PAD * 2 + COLS * SLOT + (COLS - 1) * GAP
    const ph = 34 + rows * (SLOT + GAP) + PAD + 4
    this.panelObjs.push(roundRect(PANEL_X, PANEL_Y, pw, ph, 14, 0x2b2118, 0.94, 0xf3dfb5, 3))
    this.selectedText = fix(scene.add.text(PANEL_X + PAD, PANEL_Y + 8, '', { ...label, fontSize: '14px', color: '#ffe08a' }))
    this.panelObjs.push(this.selectedText)
    ids.forEach((id, i) => {
      const x = PANEL_X + PAD + (i % COLS) * (SLOT + GAP)
      const y = PANEL_Y + 34 + Math.floor(i / COLS) * (SLOT + GAP)
      const frame = fix(scene.add.rectangle(x, y, SLOT, SLOT, 0x000000, 0.01).setOrigin(0, 0).setStrokeStyle(2, BORDER))
      const bg = fix(scene.add.image(x, y, 'ui_inventory_slot').setOrigin(0, 0).setDisplaySize(SLOT, SLOT), DEPTH)
      this.panelObjs.push(bg)
      frame.setDepth(DEPTH + 2)
      const icon = fix(scene.add.image(x + SLOT / 2, y + SLOT / 2, `icon-${id}`).setDisplaySize(SLOT - 12, SLOT - 12))
      const count = fix(scene.add.text(x + SLOT - 3, y + SLOT - 2, '', { ...label, fontSize: '14px', strokeThickness: 3, fontStyle: 'bold' }).setOrigin(1, 1))
      if (id in CROPS) frame.setInteractive({ useHandCursor: true }).on('pointerdown', () => cb.onPickSeed(id)) // bấm hạt để chọn
      this.slots.push({ id, frame, icon, count })
      this.panelObjs.push(frame, icon, count)
    })

    // Nút "Xong" (vàng) ở góc dưới-trái: đóng bảng/túi đồ đang mở.
    this.doneObjs.push(
      fix(kitButton(scene, 77, H - 35, 130, 'gold', 50)),
      fix(scene.add.text(77, H - 35, 'Xong', { fontFamily: 'sans-serif', fontSize: '24px', fontStyle: 'bold', color: '#fff6c8', stroke: '#8a5a14', strokeThickness: 5 }).setOrigin(0.5)),
      hit(12, H - 58, 124, 46, cb.onDone),
    )
    this.setVisible(this.panelObjs, false)
    this.setVisible(this.doneObjs, false)
    this.setVisible(this.chipObjs, false)
    this.setVisible(this.badge, false)
  }

  private setVisible(objs: Phaser.GameObjects.GameObject[], v: boolean) {
    for (const o of objs) (o as unknown as { setVisible(v: boolean): void }).setVisible(v)
  }

  toggleInventory(open = !this.inventoryOpen) {
    this.inventoryOpen = open
    this.setVisible(this.panelObjs, open)
  }

  update(d: HudData) {
    this.coinText.setText(String(d.money))
    this.clockText.setText(`Ngày ${d.day}  ${d.clock}`)
    for (const s of this.slots) {
      const n = d.inventory[s.id] ?? 0
      const selected = s.id === d.selectedSeed
      s.count.setText(n > 0 ? String(n) : '')
      s.icon.setAlpha(n > 0 ? 1 : 0.25) // vật phẩm chưa có thì mờ
      s.frame.setStrokeStyle(selected ? 3 : 2, selected ? BORDER_SELECTED : BORDER)
    }
    this.selectedText.setText(`Kho ${d.stock}` + (d.selectedSeed ? `   Hạt đang chọn: ${ITEMS[d.selectedSeed].name} (Q: đổi)` : ''))
    this.setVisible(this.badge, d.mailAlert)
    this.setVisible(this.doneObjs, d.showDone)
    // Chip hạt đang chọn: ẩn khi túi đồ đang mở (túi đã hiện hạt được chọn).
    const showChip = !!d.selectedSeed && !this.inventoryOpen
    this.setVisible(this.chipObjs, showChip)
    if (d.selectedSeed) {
      this.chipIcon.setTexture(`icon-${d.selectedSeed}`).setDisplaySize(22, 22)
      this.chipText.setText(`${ITEMS[d.selectedSeed].name.replace('Hạt ', '').replace('Cá giống', 'Cá giống')}  (Q)`)
    }
  }
}
