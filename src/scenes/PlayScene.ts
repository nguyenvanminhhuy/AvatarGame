import Phaser from 'phaser'
import { ALL_PLOT_IDS, MAPS, START_MAP, TILE, ZONES, buildingSpot, getMap, plotsInArea, slotHome, unlockMet, unlockText, type FeederDef, type Home, type MapDef, type PropDef, type Unlock, type ZoneId } from '../data/world'
import { ANIMALS, ANIMAL_KINDS } from '../data/animals'
import { UPGRADES } from '../data/upgrades'
import { RECIPES } from '../data/recipes'
import { clockText, hourOf, lightAt } from '../state/clock'
import { CROPS, ITEMS } from '../data/items'
import { type QuestDef } from '../data/quests'
import * as G from '../state/GameState'
import { clearSave, loadGame, saveGame } from '../state/save'
import { IDLE_FRAME, PLAYER_FOOT, PLAYER_SIZE, SIDE_FACES_RIGHT, type Dir } from '../art'
import { buildMapView } from './MapView'
import { initAudio, isMuted, resumeAudio, sfx, toggleMute } from '../audio'
import { Hud } from '../ui/Hud'
import { ShopUI, type ShopModel, type ShopCard } from '../ui/ShopUI'
import { OrderUI, type OrderModel } from '../ui/OrderUI'

const SCREEN_W = 960 // kích thước khung nhìn (khớp cấu hình trong main.ts)
const SCREEN_H = 544
const SPEED_PX = 150 // pixel / giây
const FOOT_HALF_W = 0.3 // nửa kích thước vùng chân (đơn vị ô) dùng để va chạm
const FOOT_HALF_H = 0.2
const MAX_DT_MS = 250 // chặn bước thời gian lớn (vd. quay lại từ tab khác): cây không lớn khi game không chạy
const PLOT_REACH = 1.1 // khoảng cách (ô) từ chân đến tâm ô đất để tương tác
const POND_REACH = 3.2 // vớt cá từ bờ: mặt nước không đi vào được nên với xa hơn ô ruộng
const ANIMAL_BAR_W = 32 // thanh phát triển của vật nuôi (nhỏ hơn thanh của cây: 84)
const FEEDER_BIAS = 1.2 // máng/bãi/hồ chỉ được chọn khi không có con vật nào trong tầm với (con vật luôn thắng)
const FEED_COLOR: Record<string, number> = { feed: 0xf2c94c, feed_pig: 0xb98a4a, feed_cow: 0x9ccc54, feed_fish: 0xf2994a }
const NPC_REACH = 1.6
const AUTOSAVE_MS = 10_000
const FADE_MS = 250

type ShopTab = 'seeds' | 'animals' | 'items' | 'sell' | 'storage'
// Trang logic (phím tắt, shopText) tương ứng với mỗi tab đồ họa.
const TAB_PAGE: Record<ShopTab, 'goods' | 'upgrades' | 'animals'> = { seeds: 'goods', sell: 'goods', storage: 'goods', items: 'upgrades', animals: 'animals' }
interface ShopEntry {
  card: ShopCard
  lines: string[]
  buttons: Array<{ label: string; enabled: boolean; run: () => void }>
}
type Mode = 'play' | 'dialog' | 'shop' | 'help' | 'kitchen' | 'warehouse'
type Target =
  | { kind: 'plot'; id: string; dist: number }
  | { kind: 'npc'; dist: number }
  | { kind: 'prop'; prop: PropDef; dist: number }
  | { kind: 'animal'; id: string; dist: number }
  | { kind: 'sign'; zone: ZoneId; dist: number }
  | { kind: 'feeder'; home: Home; dist: number }
  | { kind: 'nest'; item: string; dist: number }
  | { kind: 'building'; id: 'kitchen' | 'warehouse'; dist: number }

interface PlotView {
  tile: Phaser.GameObjects.Image
  plant: Phaser.GameObjects.Image
}

interface AnimalView {
  sprite: Phaser.GameObjects.Image
  bubble: Phaser.GameObjects.Image // biểu tượng trạng thái: đói (thức ăn) hoặc có sản phẩm
  home: Home // pen, free: đi lại quanh chỗ ở (chuồng đi trong phạm vi hẹp hơn); pond: bơi
  moving: boolean // đang đi (dùng khung hình đi bộ)
  eatUntil: number // thời điểm (ms) hết cảnh ăn: vừa được cho ăn thì cúi xuống ăn
  wasFed: boolean
  barBg: Phaser.GameObjects.Rectangle // thanh phát triển nhỏ phía trên con vật (hiện khi đã ăn và chưa ra sản phẩm)
  bar: Phaser.GameObjects.Rectangle
}

// Tâm ô (c, r) theo pixel.
const cx = (c: number) => (c + 0.5) * TILE
const cy = (r: number) => (r + 0.5) * TILE

export class PlayScene extends Phaser.Scene {
  private state!: G.GameState
  private map!: MapDef
  private player!: Phaser.GameObjects.Sprite
  private facing: Dir = 'down'
  private facingRight = false // hướng phải = lật ngang hướng trái
  private views = new Map<string, PlotView>()
  private blocked = new Set<string>()
  private cols = 0 // số cột hiện tại của bản đồ (nông trại dài ra khi mở rộng)
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private keys!: Record<'W' | 'A' | 'S' | 'D' | 'E' | 'ESC' | 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE' | 'SIX' | 'DEL' | 'H' | 'M' | 'Q' | 'U' | 'I' | 'ENTER' | 'SPACE' | 'F', Phaser.Input.Keyboard.Key>
  private hud!: Hud
  private hudRight!: Phaser.GameObjects.Text
  private nameTag!: Phaser.GameObjects.Container
  private currentTarget: Target | null = null // đối tượng đang ngắm (để vẽ mũi tên và thanh tiến độ)
  private arrow!: Phaser.GameObjects.Image
  private tipObjs: Phaser.GameObjects.GameObject[] = []
  private tipIcon!: Phaser.GameObjects.Image
  private tipText!: Phaser.GameObjects.Text
  private tipBar!: Phaser.GameObjects.Rectangle
  private questText!: Phaser.GameObjects.Text
  private light!: Phaser.GameObjects.Rectangle
  private fireflies: Phaser.GameObjects.Arc[] = []
  private shopPage: 'goods' | 'upgrades' | 'animals' = 'goods'
  private shopTab: ShopTab = 'seeds' // tab đang chọn trong bảng cửa hàng đồ họa
  private shopSel = 0 // ô đang chọn trong tab
  private shopFocus: 'tabs' | 'grid' = 'tabs' // bàn phím đang ở hàng tab hay ở lưới vật phẩm
  private shopUi!: ShopUI
  private orderUi!: OrderUI
  private orderModel: OrderModel | null = null // khác null: bảng 'dialog' đang hiện là khung đơn hàng
  private animalViews = new Map<string, AnimalView>()
  private nestViews: Array<{ item: string; eggs: Phaser.GameObjects.Image[]; label: Phaser.GameObjects.Text; count: number }> = []
  private trough: { f: FeederDef; gfx: Phaser.GameObjects.Graphics; sig: string } | null = null
  private hint!: Phaser.GameObjects.Text
  private toast!: Phaser.GameObjects.Text
  private panel!: Phaser.GameObjects.Text
  private panelBg!: Phaser.GameObjects.Rectangle
  private toastTimer?: Phaser.Time.TimerEvent
  private mode: Mode = 'play'
  private transitioning = false // đang chuyển bản đồ: khóa điều khiển
  private resetArmedUntil = 0
  private shopNote = ''
  private selectedSeed = '' // ID hạt giống đang chọn để trồng (chỉ là lựa chọn giao diện, không lưu)

  constructor() {
    super('Play')
  }

  // data.state có khi vừa chuyển bản đồ (giữ nguyên trạng thái trong bộ nhớ, không phụ thuộc localStorage).
  create(data?: { state?: G.GameState; note?: string }) {
    initAudio(this)
    this.views.clear()
    this.animalViews.clear()
    this.blocked.clear()
    this.mode = 'play'
    this.transitioning = false
    this.resetArmedUntil = 0
    this.shopNote = ''
    this.selectedSeed = ''

    const fromTravel = !!data?.state
    this.state = data?.state ?? loadGame(ALL_PLOT_IDS) ?? G.newGame(ALL_PLOT_IDS, MAPS[START_MAP].start)
    if (!MAPS[this.state.map]) this.state.map = START_MAP // phòng thủ: ID bản đồ lạ
    const m = (this.map = getMap(this.state.map, this.state.zones)) // nông trại dài ra theo cấp mở rộng các khu
    this.ensureSeed()

    this.cols = m.cols
    for (const b of m.buildings) for (let r = b.row; r < b.row + b.h; r++) for (let c = b.col; c < b.col + b.w; c++) this.blocked.add(`${c},${r}`)
    for (const [c, r] of m.blocked) this.blocked.add(`${c},${r}`)
    if (m.npc) this.blocked.add(`${m.npc.col},${m.npc.row}`)
    if (this.isBlocked(this.state.player.col, this.state.player.row)) {
      // Vị trí đang đứng bị chiếm (vừa mở rộng: hàng rào, biển, ô đất mới): dời tới ô trống gần nhất thay vì về điểm xuất phát.
      this.state.player = this.nearestFree(this.state.player.col, this.state.player.row) ?? { col: m.start.col, row: m.start.row }
    }

    // Camera: bản đồ nhỏ hơn khung thì căn giữa; lớn hơn thì đi theo nhân vật, dừng ở mép bản đồ.
    const mw = this.cols * TILE
    const mh = m.rows * TILE
    const cam = this.cameras.main
    cam.resetFX()
    cam.stopFollow()
    cam.removeBounds()
    cam.setBackgroundColor(m.bg)
    cam.setScroll(-(SCREEN_W - mw) / 2, -(SCREEN_H - mh) / 2)
    this.buildMap(m)

    this.player = this.add.sprite(0, 0, IDLE_FRAME.down).setOrigin(0.5, PLAYER_FOOT).setDisplaySize(PLAYER_SIZE, PLAYER_SIZE)
    if (mw > SCREEN_W || mh > SCREEN_H) {
      const bx = mw >= SCREEN_W ? 0 : -(SCREEN_W - mw) / 2
      const by = mh >= SCREEN_H ? 0 : -(SCREEN_H - mh) / 2
      cam.setBounds(bx, by, Math.max(mw, SCREEN_W), Math.max(mh, SCREEN_H))
      cam.startFollow(this.player, true, 0.15, 0.15)
      this.player.setPosition(this.state.player.col * TILE, this.state.player.row * TILE)
      cam.centerOn(this.player.x, this.player.y)
    }
    this.facing = 'down'
    this.facingRight = false
    // Thẻ tên bằng gỗ trên đầu nhân vật (như trong ảnh tham khảo).
    this.nameTag = this.add.container(0, 0, [
      this.add.image(0, 0, 'ui_name_plate').setDisplaySize(76, 38),
      this.add.text(0, 2, 'Nông dân', { fontFamily: 'sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#5a2d0c' }).setOrigin(0.5),
    ]).setDepth(9400)

    // Giao diện cố định trên màn hình (scrollFactor 0), không trôi theo camera.
    const style = { fontFamily: 'sans-serif', fontSize: '16px', color: '#ffffff', stroke: '#000000', strokeThickness: 3 }
    const ui = <T extends Phaser.GameObjects.Text>(t: T) => t.setScrollFactor(0)
    this.hud = new Hud(this, {
      onMenu: () => {
        if (this.mode !== 'play') return
        sfx('click')
        this.hud.toggleInventory()
      },
      onMail: () => this.openMail(),
      onDone: () => this.pressDone(),
      onPickSeed: (id) => {
        if (G.count(this.state, id) > 0) {
          this.selectedSeed = id
          sfx('click')
        }
      },
    })
    this.hudRight = ui(this.add.text(SCREEN_W - 12, 52, '', { ...style, fontSize: '13px' }).setOrigin(1, 0).setDepth(10000))
    this.questText = ui(
      this.add.text(SCREEN_W - 12, 74, '', { ...style, fontSize: '14px', color: '#ffe08a', align: 'right' }).setOrigin(1, 0).setDepth(10000),
    )
    this.hint = ui(this.add.text(150, SCREEN_H - 30, '', { ...style, color: '#ffe08a' }).setDepth(10000))
    // Mũi tên vàng nhấp nhô trên đối tượng đang ngắm và thanh tiến độ (biểu tượng + thời gian còn lại) như trong ảnh tham khảo.
    this.arrow = this.add.image(0, 0, 'ui_arrow_down_yellow').setDisplaySize(34, 34).setDepth(9450).setVisible(false)
    const tipBg = this.add.rectangle(0, 0, 104, 40, 0x2b2118, 0.9).setStrokeStyle(2, 0xf3dfb5).setDepth(9450).setVisible(false)
    this.tipIcon = this.add.image(0, 0, 'icon-carrot').setDisplaySize(24, 24).setDepth(9451).setVisible(false)
    this.tipText = this.add.text(0, 0, '', { fontFamily: 'sans-serif', fontSize: '14px', color: '#ffe9a8', stroke: '#000000', strokeThickness: 3 }).setOrigin(0, 0.5).setDepth(9451).setVisible(false)
    const tipBarBg = this.add.rectangle(0, 0, 84, 7, 0x000000, 0.6).setOrigin(0, 0.5).setDepth(9451).setVisible(false)
    this.tipBar = this.add.rectangle(0, 0, 84, 7, 0x6bd16a).setOrigin(0, 0.5).setDepth(9452).setVisible(false)
    this.tipObjs = [tipBg, this.tipIcon, this.tipText, tipBarBg, this.tipBar]
    this.toast = ui(this.add.text(SCREEN_W / 2, SCREEN_H - 70, '', { ...style, color: '#b7f5b0' }).setOrigin(0.5, 0).setDepth(10000))
    this.panelBg = this.add
      .rectangle(SCREEN_W / 2, SCREEN_H / 2 - 40, 10, 10, 0x2b2118, 0.94)
      .setStrokeStyle(3, 0xf3dfb5)
      .setScrollFactor(0)
      .setDepth(10001)
      .setVisible(false)
    this.panel = ui(
      this.add
        .text(SCREEN_W / 2, SCREEN_H / 2 - 40, '', {
          fontFamily: 'sans-serif',
          fontSize: '18px',
          color: '#ffffff',
          lineSpacing: 4,
        })
        .setOrigin(0.5)
        .setDepth(10002)
        .setVisible(false),
    )

    this.orderUi = new OrderUI(this, () => this.pressDone())
    this.shopUi = new ShopUI(this, {
      onTab: (id) => {
        this.selectTab(id as ShopTab)
        this.shopFocus = 'tabs'
      },
      onCard: (i) => {
        this.shopSel = i
        this.shopFocus = 'grid'
        sfx('click')
      },
      onButton: (i) => {
        const { entry, extra } = this.shopContent()
        const list = [...(entry?.buttons ?? []), ...extra]
        const b = list[i]
        if (!b) return
        if (b.enabled) b.run()
        else {
          this.shopNote = 'Chưa thể thực hiện.'
          sfx('error')
        }
      },
      onClose: () => {
        sfx('click')
        this.closePanel()
      },
    })

    const kb = this.input.keyboard!
    this.cursors = kb.createCursorKeys()
    const K = Phaser.Input.Keyboard.KeyCodes
    this.keys = {
      W: kb.addKey(K.W),
      A: kb.addKey(K.A),
      S: kb.addKey(K.S),
      D: kb.addKey(K.D),
      E: kb.addKey(K.E),
      ESC: kb.addKey(K.ESC),
      ONE: kb.addKey(K.ONE),
      TWO: kb.addKey(K.TWO),
      THREE: kb.addKey(K.THREE),
      FOUR: kb.addKey(K.FOUR),
      FIVE: kb.addKey(K.FIVE),
      SIX: kb.addKey(K.SIX),
      Q: kb.addKey(K.Q),
      DEL: kb.addKey(K.DELETE),
      H: kb.addKey(K.H),
      M: kb.addKey(K.M),
      U: kb.addKey(K.U),
      ENTER: kb.addKey(K.ENTER),
      SPACE: kb.addKey(K.SPACE),
      F: kb.addKey(K.F),
      I: kb.addKey(K.I),
    }

    // Lưu định kỳ và khi đóng/ẩn trang. Dọn khi rời scene.
    const timer = this.time.addEvent({ delay: AUTOSAVE_MS, loop: true, callback: () => this.save() })
    const onHide = () => this.save()
    window.addEventListener('pagehide', onHide)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      timer.remove()
      window.removeEventListener('pagehide', onHide)
    })

    // Ánh sáng ngày/đêm: lớp phủ toàn màn hình (dưới HUD), đổi màu và độ đậm theo giờ. Trong nhà không phủ.
    this.light = this.add.rectangle(SCREEN_W / 2, SCREEN_H / 2, SCREEN_W, SCREEN_H, 0x000000, 0).setScrollFactor(0).setDepth(9500)
    this.fireflies = []
    {
      // Đom đóm ban đêm: các chấm sáng trôi nhẹ trong bản đồ, chỉ hiện khi trời tối.
      const fireflyCount = Math.min(70, Math.round((14 * mw * mh) / (SCREEN_W * SCREEN_H))) // bản đồ lớn thì nhiều đom đóm hơn
      for (let i = 0; i < fireflyCount; i++) {
        const x = Phaser.Math.Between(20, mw - 20)
        const y = Phaser.Math.Between(20, mh - 20)
        const f = this.add.circle(x, y, 2.5, 0xfff09a, 1).setDepth(9400).setAlpha(0)
        this.tweens.add({
          targets: f,
          x: x + Phaser.Math.Between(-60, 60),
          y: y + Phaser.Math.Between(-40, 40),
          duration: Phaser.Math.Between(3000, 6000),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        })
        this.fireflies.push(f)
      }
    }

    if (fromTravel) this.cameras.main.fadeIn(FADE_MS, 0, 0, 0)
    this.say(
      data?.note
        ? data.note
        : fromTravel
        ? `Bạn đang ở: ${m.name}`
        : this.state.flags.gotStarter
          ? 'Chào mừng trở lại! (H: hướng dẫn)'
          : 'Chào mừng! Hãy nói chuyện với lái buôn ở khu chợ, nhấn E. (H: hướng dẫn)',
    )
  }

  // Vật nuôi thả rông: lúc đứng yên, lúc đi tới một điểm ngẫu nhiên quanh chỗ ở (không ra khỏi bãi cỏ).
  private startWander(v: AnimalView, hx: number, hy: number, rx = 24, ry = 8) {
    const go = () => {
      if (this.time.now < v.eatUntil) return void this.time.delayedCall(400, go) // đang ăn thì chưa đi
      const tx = hx + Phaser.Math.Between(-rx, rx)
      const ty = hy + Phaser.Math.Between(-ry, ry)
      v.sprite.setFlipX(tx < v.sprite.x) // ảnh gốc quay mặt sang phải
      v.moving = true
      this.tweens.add({
        targets: v.sprite,
        x: tx,
        y: ty,
        duration: Phaser.Math.Between(700, 1500),
        ease: 'Sine.easeInOut',
        onUpdate: () => v.sprite.setDepth(v.sprite.y),
        onComplete: () => {
          v.moving = false
          this.time.delayedCall(Phaser.Math.Between(600, 2200), go)
        },
      })
    }
    this.time.delayedCall(Phaser.Math.Between(0, 1500), go)
  }

  // Cá bơi khắp mặt hồ: đổi hướng liên tục, bơi nhanh (khoảng 95 px/giây), lượn đuôi khi bơi, nghỉ rất ngắn rồi bơi tiếp,
  // đôi khi quẫy nhanh. Không ra khỏi mặt nước.
  private startSwim(v: AnimalView) {
    const pond = this.map.pond
    if (!pond) return
    const x0 = pond.col * TILE + 24 // chừa nửa thân cá + mép bo của mặt nước: cá không lên bờ
    const x1 = (pond.col + pond.w) * TILE - 24
    const y0 = pond.row * TILE + 20
    const y1 = (pond.row + pond.h) * TILE - 20
    const go = () => {
      const dart = Math.random() < 0.2 // thỉnh thoảng phóng nhanh sang chỗ khác
      const reach = dart ? 220 : 130
      const tx = Phaser.Math.Clamp(v.sprite.x + Phaser.Math.Between(-reach, reach), x0, x1)
      const ty = Phaser.Math.Clamp(v.sprite.y + Phaser.Math.Between(-reach * 0.6, reach * 0.6), y0, y1)
      const dist = Math.hypot(tx - v.sprite.x, ty - v.sprite.y)
      const dur = Phaser.Math.Clamp((dist / (dart ? 190 : 95)) * 1000, 350, 2200)
      v.sprite.setFlipX(tx < v.sprite.x) // ảnh gốc quay mặt sang phải
      v.moving = true
      const tilt = Math.atan2(ty - v.sprite.y, Math.abs(tx - v.sprite.x) + 1) * (180 / Math.PI) * 0.35 * (tx < v.sprite.x ? -1 : 1) // chúi mũi nhẹ theo hướng bơi (đảo dấu khi quay trái)
      const wiggle = this.tweens.add({ targets: v.sprite, angle: { from: tilt - 9, to: tilt + 9 }, duration: dart ? 90 : 170, yoyo: true, repeat: -1 })
      this.tweens.add({
        targets: v.sprite,
        x: tx,
        y: ty,
        duration: dur,
        ease: dart ? 'Quad.easeOut' : 'Sine.easeInOut',
        onUpdate: () => v.sprite.setDepth(v.sprite.y),
        onComplete: () => {
          wiggle.stop()
          v.sprite.setAngle(0)
          v.moving = false
          this.time.delayedCall(Phaser.Math.Between(80, 600), go)
        },
      })
    }
    this.time.delayedCall(Phaser.Math.Between(0, 1200), go)
  }

  // Dựng nền và vật thể: phần tĩnh ở MapView; ô đất và vật nuôi (hình theo GameState) dựng ở đây.
  private buildMap(m: MapDef) {
    buildMapView(this, m)
    for (const def of m.plots) {
      const tile = this.add.image(cx(def.col), cy(def.row), 'plot-dry').setDisplaySize(TILE, TILE).setDepth(-1)
      // Cây neo ở đáy ô để cây cao mọc lên phía trên.
      const plant = this.add
        .image(cx(def.col), cy(def.row) + TILE / 2, 'plant-carrot-seed')
        .setOrigin(0.5, 1)
        .setDisplaySize(TILE, TILE)
        .setDepth(cy(def.row) + 10)
        .setVisible(false)
      this.views.set(def.id, { tile, plant })
    }
    for (const slot of m.animalSlots) {
      const home: Home = slot.free ? 'free' : slot.pond ? 'pond' : 'pen'
      const x = cx(slot.col)
      const y = home === 'pond' ? cy(slot.row) : cy(slot.row) + TILE / 2 - 4 // cá neo ở giữa ô nước
      const sprite = this.add.image(x, y, 'chicken_idle_1').setOrigin(0.5, home === 'pond' ? 0.5 : 0.92).setDisplaySize(44, 44).setDepth(y).setVisible(false)
      const bubble = this.add.image(x, y - 56, 'icon-feed').setDisplaySize(22, 22).setDepth(9000).setVisible(false)
      const barBg = this.add.rectangle(x, y, ANIMAL_BAR_W, 5, 0x000000, 0.75).setStrokeStyle(1, 0x000000, 1).setOrigin(0, 0.5).setDepth(9001).setVisible(false)
      const bar = this.add.rectangle(x, y, ANIMAL_BAR_W, 5, 0x7be37a).setOrigin(0, 0.5).setDepth(9002).setVisible(false)
      const view: AnimalView = { sprite, bubble, home, moving: false, eatUntil: 0, wasFed: true, barBg, bar }
      if (home === 'free') this.startWander(view, x, y)
      else if (home === 'pen') this.startWander(view, x, y, 26, 7)
      else if (home === 'pond') this.startSwim(view)
      this.animalViews.set(slot.id, view)
    }
    this.nestViews = []
    for (const n of m.nests ?? []) {
      const x = cx(n.col)
      const y = (n.row + 1) * TILE - 6
      const g = this.add.graphics().setDepth(y - 1)
      g.fillStyle(0x000000, 0.18).fillEllipse(x, y + 1, 34, 12)
      g.fillStyle(0xb98a3e, 1).fillEllipse(x, y - 3, 32, 14)
      g.fillStyle(0xd9b25f, 1).fillEllipse(x, y - 5, 26, 9)
      g.lineStyle(1, 0x8a6325, 1)
      for (let i = -3; i <= 3; i++) g.lineBetween(x + i * 4, y - 5, x + i * 4 + 2, y + 1)
      const eggs = Array.from({ length: 6 }, (_, i) => this.add.image(x - 10 + (i % 3) * 10, y - 8 + Math.floor(i / 3) * 4, `icon-${n.item}`).setDisplaySize(11, 11).setDepth(y + 1 + i * 0.1).setVisible(false))
      const label = this.add.text(x, y - 20, '', { fontFamily: 'sans-serif', fontSize: '11px', color: '#fff', stroke: '#3a2410', strokeThickness: 3 }).setOrigin(0.5).setDepth(9000).setVisible(false)
      this.nestViews.push({ item: n.item, eggs, label, count: -1 })
    }
    for (const f of m.feeders ?? []) if (f.home === 'pen') this.trough = { f, gfx: this.add.graphics(), sig: '' }
  }

  // Máng ăn của chuồng: vẽ bằng đồ họa, đầy dần theo số con đã ăn.
  private drawTrough() {
    const t = this.trough
    if (!t) return
    const s = this.state
    const total = G.homeCount(s, 'pen')
    const fed = Object.entries(s.animals).filter(([id, a]) => a.kind !== '' && a.fed && slotHome(id) === 'pen').length
    const ratio = total > 0 ? fed / total : 0
    const sig = `${t.f.w}|${ratio.toFixed(2)}`
    if (sig === t.sig) return
    t.sig = sig
    const { f, gfx } = t
    const w = f.w * TILE - 8
    const x = f.col * TILE + 4
    const y = cy(f.row) - 4
    gfx.clear().setDepth(cy(f.row) + 6)
    gfx.fillStyle(0x000000, 0.2).fillEllipse(x + w / 2, y + 24, w + 4, 8) // bóng
    gfx.fillStyle(0x7a4a22, 1).fillRoundedRect(x, y, w, 20, 5) // thân máng
    gfx.fillStyle(0x4a2a10, 1).fillRoundedRect(x + 3, y + 3, w - 6, 11, 3) // lòng máng
    if (ratio > 0) gfx.fillStyle(0xd9a441, 1).fillRoundedRect(x + 3, y + 3, Math.max(8, (w - 6) * ratio), 11, 3) // thức ăn
    gfx.lineStyle(2, 0x3a1e08, 1).strokeRoundedRect(x, y, w, 20, 5)
    gfx.fillStyle(0x5a3416, 1).fillRect(x + 8, y + 20, 5, 6).fillRect(x + w - 13, y + 20, 5, 6) // chân máng
  }

  // Hiệu ứng rải/đổ thức ăn: các hạt rơi xuống và nằm lại một lúc ở nơi cho ăn (bãi cỏ, máng, mặt hồ).
  private scatterFood(home: Home, food: string[]) {
    const colors = food.length ? food.map((f) => FEED_COLOR[f] ?? 0xf2c94c) : [0xf2c94c]
    for (const f of (this.map.feeders ?? []).filter((x) => x.home === home)) {
      const n = Math.max(8, Math.min(24, Math.round(f.w * f.h * 2)))
      for (let i = 0; i < n; i++) {
        const x = (f.col + 0.2 + Math.random() * (f.w - 0.4)) * TILE
        const y = (f.row + 0.2 + Math.random() * (f.h - 0.4)) * TILE
        const dot = this.add.circle(x, y - 36, 3, colors[i % colors.length]).setDepth(9000).setAlpha(0)
        const sink = home === 'pond'
        this.tweens.add({
          targets: dot,
          y,
          alpha: 1,
          duration: 260 + Math.random() * 260,
          delay: Math.random() * 260,
          ease: 'Quad.easeIn',
          onComplete: () => this.tweens.add({ targets: dot, alpha: 0, scale: sink ? 0.4 : 1, duration: sink ? 900 : 700, delay: sink ? 300 : 1600, onComplete: () => dot.destroy() }),
        })
      }
    }
  }

  // Đổi hình cây; chiều cao theo tỷ lệ ảnh (cà chua cao gấp đôi ô), chiều rộng luôn bằng một ô.
  private setPlantArt(img: Phaser.GameObjects.Image, key: string) {
    if (img.texture.key !== key) img.setTexture(key)
    img.setDisplaySize(TILE, (TILE * img.frame.height) / img.frame.width)
  }

  private save() {
    saveGame(this.state)
  }

  private say(text: string) {
    this.toast.setText(text)
    this.toastTimer?.remove()
    this.toastTimer = this.time.delayedCall(3000, () => this.toast.setText(''))
  }

  // Vùng chân là hình chữ nhật nhỏ; bất kỳ góc nào vào ô bị chặn hoặc ra ngoài bản đồ thì bị chặn.
  // Tâm ô trống gần (col, row) nhất trong bán kính 8 ô; null nếu không có.
  private nearestFree(col: number, row: number): { col: number; row: number } | null {
    let best: { col: number; row: number } | null = null
    let bestD = Infinity
    for (let dr = -8; dr <= 8; dr++) {
      for (let dc = -8; dc <= 8; dc++) {
        const c = Math.floor(col) + dc + 0.5
        const r = Math.floor(row) + dr + 0.5
        const d = Math.hypot(c - col, r - row)
        if (d < bestD && !this.isBlocked(c, r)) {
          best = { col: c, row: r }
          bestD = d
        }
      }
    }
    return best
  }

  private isBlocked(col: number, row: number) {
    for (const dx of [-FOOT_HALF_W, FOOT_HALF_W]) {
      for (const dy of [-FOOT_HALF_H, FOOT_HALF_H]) {
        const c = Math.floor(col + dx)
        const r = Math.floor(row + dy)
        if (c < 0 || r < 0 || c >= this.cols || r >= this.map.rows) return true
        if (this.blocked.has(`${c},${r}`)) return true
      }
    }
    return false
  }

  private findTarget(): Target | null {
    const { col, row } = this.state.player
    const m = this.map
    let best: Target | null = null
    const consider = (t: Target, reach: number) => {
      if (t.dist <= reach && (!best || t.dist < best.dist)) best = t
    }
    for (const def of m.plots) {
      if (!this.plotUnlocked(def)) continue // ô đất chưa mở thì chưa tương tác được
      consider({ kind: 'plot', id: def.id, dist: Math.hypot(def.col + 0.5 - col, def.row + 0.5 - row) }, PLOT_REACH)
    }
    // Biển mở rộng ruộng cắm ngay trên ô đất sắp mở, nằm giữa các ô khác: ưu tiên nó khi đứng cạnh.
    for (const sg of m.signs) consider({ kind: 'sign', zone: sg.zone, dist: Math.hypot(sg.col + 0.5 - col, sg.row + 0.5 - row) - (sg.zone === 'field' ? 0.45 : 0) }, NPC_REACH)
    for (const b of m.buildings) {
      const spot = buildingSpot(b)
      consider({ kind: 'building', id: b.id, dist: Math.hypot(spot.col + 0.5 - col, spot.row + 0.5 - row) }, PLOT_REACH)
    }
    if (m.npc) consider({ kind: 'npc', dist: Math.hypot(m.npc.col + 0.5 - col, m.npc.row + 0.5 - row) }, NPC_REACH)
    for (const p of m.props) {
      if (!p.action) continue
      const spot = buildingSpot(p)
      consider({ kind: 'prop', prop: p, dist: Math.hypot(spot.col + 0.5 - col, spot.row + 0.5 - row) }, PLOT_REACH)
    }
    for (const slot of m.animalSlots) {
      if (this.state.animals[slot.id]?.kind) {
        // Hệ số 0.9: khi đứng giữa chuồng và ô đất kề nhau, vật nuôi được ưu tiên.
        // Vật nuôi thả rông tính theo vị trí thật của nó (đang đi lại quanh chỗ ở).
        const v = this.animalViews.get(slot.id)
        const roam = (slot.free || slot.pond) && v
        const ax = roam ? v.sprite.x / TILE : slot.col + 0.5
        const ay = roam ? (slot.pond ? v.sprite.y / TILE : (v.sprite.y - TILE / 2 + 4) / TILE) : slot.row + 0.5
        const dist = Math.hypot(ax - col, ay - row) * 0.9
        consider({ kind: 'animal', id: slot.id, dist }, slot.pond ? POND_REACH : PLOT_REACH)
      }
    }
    // Ổ trứng: chỉ khi trong ổ có trứng; đứng gần ổ thì lấy hết trứng của loài đó.
    for (const n of m.nests ?? []) {
      if ((this.state.nests[n.item] ?? 0) > 0) consider({ kind: 'nest', item: n.item, dist: Math.hypot(n.col + 0.5 - col, n.row + 0.5 - row) - 2 }, PLOT_REACH)
    }
    // Nơi rải thức ăn (máng, bãi cỏ, mặt hồ): chỉ khi có con đang đói và không có con vật nào trong tầm với.
    for (const f of m.feeders ?? []) {
      if (G.hungryCount(this.state, f.home) === 0) continue
      const dx = Math.max(f.col - col, 0, col - (f.col + f.w))
      const dy = Math.max(f.row - row, 0, row - (f.row + f.h))
      consider({ kind: 'feeder', home: f.home, dist: Math.hypot(dx, dy) + FEEDER_BIAS }, FEEDER_BIAS + (f.home === 'pond' ? 1.3 : 0.9))
    }
    return best
  }

  // Các loại thức ăn đang cần cho những con đói ở một nơi ở, kèm số phần đang có trong kho.
  private feedNeeds(home: Home): Array<{ id: string; need: number; have: number }> {
    const need = new Map<string, number>()
    for (const [id, a] of Object.entries(this.state.animals)) {
      if (a.kind === '' || a.fed || slotHome(id) !== home) continue
      const food = ANIMALS[a.kind].feed
      need.set(food, (need.get(food) ?? 0) + 1)
    }
    return [...need].map(([id, n]) => ({ id, need: n, have: G.count(this.state, id) }))
  }

  private feedVerb(home: Home) {
    return home === 'pen' ? 'Đổ thức ăn vào máng' : home === 'pond' ? 'Rải thức ăn xuống hồ' : 'Rải thức ăn ra đất'
  }

  // Gợi ý rải/đổ thức ăn cho cả nhóm đang đói; báo thiếu loại thức ăn nào.
  private describeFeed(home: Home): string {
    const needs = this.feedNeeds(home)
    const hungry = needs.reduce((n, x) => n + x.need, 0)
    const lack = needs.filter((x) => x.have < x.need).map((x) => ITEMS[x.id].name.toLowerCase())
    if (needs.every((x) => x.have < 1)) return `${hungry} con đói, hết ${lack.join(', ')} (mua ở cửa hàng)`
    return `E: ${this.feedVerb(home)} (${hungry} con đói${lack.length ? ', thiếu ' + lack.join(', ') : ''})`
  }

  // Gợi ý cho vật nuôi theo trạng thái.
  private describeAnimal(id: string): string {
    const a = this.state.animals[id]
    const def = ANIMALS[a.kind]
    if (G.animalReady(a)) return `E: ${def.home === 'pond' ? 'Vớt' : 'Nhặt'} ${ITEMS[def.product].name.toLowerCase()}`
    if (!a.fed) return this.describeFeed(def.home)
    return `${def.name} đang ăn... ${Math.floor(G.animalProgress(a) * 100)}%`
  }

  // Rải/đổ thức ăn cho cả nhóm ở một nơi ở bằng một lần bấm.
  private feedHome(home: Home) {
    const needs = this.feedNeeds(home).map((x) => x.id)
    const r = G.feedHome(this.state, home)
    if (r.result === 'ok') {
      this.scatterFood(home, needs)
      const lack = r.missing.map((id) => ITEMS[id].name.toLowerCase())
      this.say(`${this.feedVerb(home)}: ${r.fed} con được ăn${lack.length ? '. Hết ' + lack.join(', ') + ' nên còn con đói' : '. Chờ một lúc sẽ có sản phẩm'}.`)
      sfx('plant')
    } else if (r.result === 'no-feed') {
      this.say(`Hết ${r.missing.map((id) => ITEMS[id].name.toLowerCase()).join(', ')}. Hãy mua ở cửa hàng.`)
      sfx('error')
    } else this.say('Tất cả đã ăn rồi.')
    this.save()
  }

  // Lấy hết trứng của một loài trong ổ về kho.
  private collectNest(item: string) {
    const r = G.collectNest(this.state, item)
    const n = this.map.nests?.find((x) => x.item === item)
    if (r.result === 'ok') {
      const name = ITEMS[item].name
      const left = this.state.nests[item] ?? 0
      this.say(`Lấy ${r.taken} ${name.toLowerCase()} từ ổ${left > 0 ? `. Kho hết chỗ nên còn ${left} trong ổ` : ''}.`)
      if (n) this.feedbackAt(cx(n.col), cy(n.row) - 10, `+${r.taken} ${name}`, '#ffd37a', true)
      sfx('harvest')
    } else if (r.result === 'full') this.fullMessage()
    this.save()
  }

  private interactAnimal(id: string) {
    const s = this.state
    const a = s.animals[id]
    const def = ANIMALS[a.kind]
    const slot = this.map.animalSlots.find((x) => x.id === id)
    const v = this.animalViews.get(id)
    const at = v ? { x: v.sprite.x, y: v.sprite.y - 20 } : slot ? { x: cx(slot.col), y: cy(slot.row) - 20 } : { x: 0, y: 0 }
    if (G.animalReady(a)) {
      const r = G.collectProduct(s, id)
      if (r === 'ok') {
        const name = ITEMS[def.product].name
        this.say(`${def.home === 'pond' ? 'Vớt' : 'Nhặt'} được 1 ${name.toLowerCase()}!`)
        this.feedbackAt(at.x, at.y, '+1 ' + name, '#ffd37a', true)
        sfx('harvest')
      } else if (r === 'full') this.fullMessage()
      this.save()
    } else if (!a.fed) this.feedHome(def.home)
  }

  private ownedSeeds(): string[] {
    return Object.keys(CROPS).filter((id) => G.count(this.state, id) > 0)
  }

  // Giữ hạt đang chọn hợp lệ: hết hạt thì chuyển sang loại còn lại (hoặc rỗng nếu không còn hạt nào).
  private ensureSeed() {
    const owned = this.ownedSeeds()
    if (!owned.includes(this.selectedSeed)) this.selectedSeed = owned[0] ?? ''
  }

  private cycleSeed() {
    const owned = this.ownedSeeds()
    if (owned.length === 0) {
      this.say('Bạn không có hạt giống.')
      sfx('error')
      return
    }
    this.selectedSeed = owned[(owned.indexOf(this.selectedSeed) + 1) % owned.length]
    this.say(`Đang chọn: ${ITEMS[this.selectedSeed].name}`)
    sfx('click')
  }

  private describe(t: Target | null): string {
    if (!t) return ''
    if (t.kind === 'npc') return 'E: Nói chuyện'
    if (t.kind === 'building') return this.describeBuilding(t.id)
    if (t.kind === 'sign') return `E: Mở rộng ${ZONES[t.zone].name} (${G.zoneCost(this.state, t.zone)} tiền, ${ZONES[t.zone].effect})`
    if (t.kind === 'animal') return this.describeAnimal(t.id)
    if (t.kind === 'feeder') return this.describeFeed(t.home)
    if (t.kind === 'nest') return `E: Lấy ${this.state.nests[t.item]} ${ITEMS[t.item].name.toLowerCase()} trong ổ`
    if (t.kind === 'prop') return t.prop.action === 'shop' ? 'E: Cửa hàng (mua, bán, nâng cấp, vật nuôi)' : 'E: Xem đơn hàng ở bảng tin'
    const p = this.state.plots[t.id]
    if (G.isReady(p)) return 'E: Thu hoạch'
    if (!p.planted) {
      const seed = this.selectedSeed
      if (!seed) return 'Ô đất trống (cần hạt giống)'
      return `E: Trồng ${ITEMS[seed].name.replace('Hạt ', '')}`
    }
    if (!p.watered) return 'E: Tưới nước'
    return `Đang lớn... ${Math.floor(G.growProgress(p) * 100)}%`
  }

  private describeBuilding(id: 'kitchen' | 'warehouse'): string {
    const s = this.state
    if (id === 'warehouse') return `E: Nhà kho (${G.totalItems(s)}/${G.capacity(s)})`
    const ready = G.kitchenReadyIndex(s)
    if (ready >= 0) return `E: Lấy ${ITEMS[RECIPES.find((x) => x.id === s.kitchen[ready]!.recipe)!.output].name.toLowerCase()}`
    if (G.kitchenFreeSlot(s) >= 0) return `E: Nhà bếp (chế biến nông sản, đang nấu ${G.kitchenBusyCount(s)}/${G.kitchenSlots(s)})`
    return `Nhà bếp đang nấu hết ${G.kitchenSlots(s)} mẻ... ${Math.floor(Math.max(...s.kitchen.map((j) => G.jobProgress(j))) * 100)}%`
  }

  private interactBuilding(id: 'kitchen' | 'warehouse') {
    const s = this.state
    sfx('click')
    if (id === 'warehouse') {
      this.shopNote = ''
      this.shopTab = 'storage'
      this.shopSel = 0
      this.shopFocus = 'grid'
      this.openPanel('warehouse', this.warehouseText())
      return
    }
    const ready = G.kitchenReadyIndex(s)
    if (ready < 0) {
      if (G.kitchenFreeSlot(s) >= 0) {
        this.shopNote = ''
        this.shopSel = 0
        this.shopFocus = 'grid'
        this.openPanel('kitchen', this.kitchenText())
      } else {
        this.say('Tất cả các mẻ đang nấu. Chờ một mẻ xong rồi ra lấy.')
      }
      return
    }
    const recipe = RECIPES.find((x) => x.id === s.kitchen[ready]!.recipe)!
    const r = G.collectCooked(s)
    if (r === 'ok') {
      const name = ITEMS[recipe.output].name
      const b = this.map.buildings.find((x) => x.id === 'kitchen')!
      this.say(`Lấy được ${recipe.yield} ${name.toLowerCase()}!`)
      this.feedbackAt(cx(b.col + 1), cy(b.row + 2) - 20, '+' + recipe.yield + ' ' + name, '#ffd37a', true)
      sfx('harvest')
      this.save()
    } else if (r === 'full') this.fullMessage()
  }

  private fullMessage() {
    this.say('Kho đầy! Hãy bán bớt hoặc nâng cấp nhà kho.')
    sfx('error')
  }

  // Bảng nhà bếp: trạng thái từng ô nấu và mỗi công thức một phím số; hiện nguyên liệu đang có.
  private kitchenText() {
    const s = this.state
    const lines = ['NHÀ BẾP', 'Nấu xong ra lấy ở nhà bếp (thời gian chỉ chạy khi game đang mở).']
    for (let i = 0; i < G.kitchenSlots(s); i++) {
      const job = s.kitchen[i]
      const rc = job && RECIPES.find((x) => x.id === job.recipe)
      lines.push(`Bếp ${i + 1}: ${rc ? `${rc.name} ${G.jobReady(job) ? '- xong!' : Math.floor(G.jobProgress(job) * 100) + '%'}` : 'trống'}`)
    }
    lines.push('')
    RECIPES.forEach((rc, i) => {
      const need = Object.entries(rc.inputs)
        .map(([id, n]) => `${ITEMS[id].name} ${G.count(s, id)}/${n}`)
        .join(', ')
      lines.push(`[${i + 1}] ${rc.name}: ${need} -> bán ${ITEMS[rc.output].sellPrice}, ${rc.cookMs / 1000} giây`)
    })
    lines.push('', this.shopNote, '[E] hoặc [ESC] để đóng')
    return lines.join('\n')
  }

  private warehouseText() {
    const s = this.state
    const lines = ['NHÀ KHO', `Sức chứa: ${G.totalItems(s)}/${G.capacity(s)} vật phẩm   Tiền: ${s.money}`, '']
    const have = Object.keys(ITEMS).filter((id) => G.count(s, id) > 0)
    lines.push(have.length ? have.map((id) => `${ITEMS[id].name} x${G.count(s, id)}`).join(', ') : 'Kho trống.')
    const cost = G.zoneCost(s, 'warehouse')
    lines.push('')
    lines.push(cost === null ? 'Kho đã đạt cấp tối đa.' : `[1] Mở rộng kho: ${ZONES.warehouse.effect} - giá ${cost} tiền (hoặc mua ở biển MUA cạnh nhà kho)`)
    lines.push('', this.shopNote, '[E] hoặc [ESC] để đóng')
    return lines.join('\n')
  }

  private cookRecipe(rc: (typeof RECIPES)[number]) {
    const r = G.startCooking(this.state, rc.id)
    if (r === 'ok') {
      this.say(`Bắt đầu nấu ${rc.name.toLowerCase()}. Ra lấy sau ${rc.cookMs / 1000} giây.`)
      sfx('plant')
      this.save()
      // Còn bếp trống thì giữ bảng mở để nấu tiếp, hết thì đóng.
      if (G.kitchenFreeSlot(this.state) < 0) {
        this.closePanel()
        return
      }
      this.shopNote = `Đã bắt đầu nấu ${rc.name.toLowerCase()}.`
    } else {
      this.shopNote = r === 'no-ingredients' ? 'Chưa đủ nguyên liệu.' : r === 'busy' ? 'Nhà bếp đang bận.' : ''
      sfx('error')
    }
  }

  private updateKitchen() {
    this.shopNav()
    const keys = [this.keys.ONE, this.keys.TWO, this.keys.THREE, this.keys.FOUR, this.keys.FIVE, this.keys.SIX]
    const i = keys.findIndex((k) => Phaser.Input.Keyboard.JustDown(k))
    if (i >= 0 && i < RECIPES.length) this.cookRecipe(RECIPES[i])
    if (this.mode === 'kitchen') this.setPanel(this.kitchenText(), true)
  }

  private updateWarehouse() {
    this.shopNav()
    if (Phaser.Input.Keyboard.JustDown(this.keys.ONE)) this.expandWarehouse()
    this.setPanel(this.warehouseText(), true)
  }

  private expandWarehouse() {
    const r = G.buyZone(this.state, 'warehouse')
    if (r === 'ok') {
      sfx('buy')
      this.save()
      this.scene.restart({ state: this.state, note: 'Đã mở rộng nhà kho!' }) // dựng lại để biển MUA cập nhật
      return
    }
    this.shopNote = r === 'no-money' ? 'Không đủ tiền.' : r === 'max-level' ? 'Kho đã đạt cấp tối đa.' : ''
    sfx('error')
  }

  private interact(t: Target) {
    if (t.kind === 'building') {
      this.interactBuilding(t.id)
      return
    }
    if (t.kind === 'sign') {
      const zone = t.zone
      const cost = G.zoneCost(this.state, zone)
      const r = G.buyZone(this.state, zone)
      if (r === 'ok') {
        sfx('buy')
        this.save()
        this.scene.restart({ state: this.state, note: `Đã mở rộng ${ZONES[zone].name}!` })
      } else {
        this.say(r === 'no-money' ? `Không đủ tiền (cần ${cost}).` : `${ZONES[zone].name} đã mở rộng tối đa.`)
        sfx('error')
      }
      return
    }
    if (t.kind === 'prop') {
      sfx('click')
      if (t.prop.action === 'quests') {
        this.openMail()
      } else {
        this.openShop()
      }
      return
    }
    if (t.kind === 'animal') {
      this.interactAnimal(t.id)
      return
    }
    if (t.kind === 'feeder') {
      this.feedHome(t.home)
      return
    }
    if (t.kind === 'nest') {
      this.collectNest(t.item)
      return
    }
    if (t.kind === 'npc') {
      sfx('click')
      if (G.giveStarter(this.state)) {
        this.openPanel('dialog', 'Lái buôn:\n"Chào bạn! Tặng bạn 3 hạt cà rốt để khởi đầu.\nTrồng, tưới nước, chờ lớn rồi mang đến bán cho tôi nhé!"\n\n[E] Tiếp tục')
        this.save()
      } else {
        this.openShop()
      }
      return
    }
    const s = this.state
    const p = s.plots[t.id]
    if (G.isReady(p)) {
      const cropId = p.crop // ghi nhớ trước khi thu hoạch làm trống ô
      const r = G.harvest(s, t.id)
      if (r === 'ok') {
        const name = ITEMS[CROPS[cropId].harvestItem].name
        this.say(`Thu hoạch được 1 ${name}!`)
        this.feedback(t.id, '+1 ' + name, '#ffd37a', true)
        sfx('harvest')
      } else if (r === 'full') this.fullMessage()
    } else if (!p.planted) {
      const r = this.selectedSeed ? G.plant(s, t.id, this.selectedSeed) : 'no-seed'
      if (r === 'ok') {
        this.say('Đã gieo hạt. Nhớ tưới nước!')
        this.feedback(t.id, 'Gieo hạt', '#ffffff', false)
        sfx('plant')
      } else if (r === 'no-seed') {
        this.say('Bạn không có hạt giống. Hãy đến cửa hàng mua.')
        sfx('error')
      }
    } else if (!p.watered) {
      // Bình tưới lớn: các ô lân cận cũng được tưới cùng (chỉ ô đã mở).
      const extra = plotsInArea(this.map.plots, t.id, G.waterLevel(s), (d) => this.plotUnlocked(d)).slice(1)
      const wateredBefore = new Set(extra.filter((id) => s.plots[id].watered))
      const r = G.water(s, t.id, extra)
      if (r === 'ok') {
        this.say(`Đã tưới. Cây sẽ lớn sau ${CROPS[p.crop].growMs / 1000} giây.`)
        this.feedback(t.id, 'Tưới nước', '#9fd8ff', false)
        for (const id of extra) if (s.plots[id].watered && !wateredBefore.has(id)) this.feedback(id, 'Tưới nước', '#9fd8ff', false)
        sfx('water')
      }
    }
    this.save()
  }

  private plotUnlocked(def: { unlock?: Unlock }) {
    return unlockMet(this.state.zones, def.unlock)
  }

  // Vật phẩm mua được ở cửa hàng: có giá mua và đã mở khóa, theo thứ tự khai báo trong catalog.
  private buyables(): string[] {
    return Object.keys(ITEMS).filter((id) => G.isBuyable(this.state, id))
  }

  // "Cà rốt 1/3, Cà chua 0/2" cho đơn hàng hiện tại.
  private questProgressText(q: QuestDef) {
    return G.questProgress(this.state, q)
      .map((p) => `${ITEMS[p.id].name} ${p.have}/${p.need}`)
      .join(', ')
  }

  // Trang nâng cấp của cửa hàng: mỗi nâng cấp một phím số, hiện cấp hiện tại, hiệu ứng và giá cấp kế.
  private upgradesText() {
    const s = this.state
    const lines = ['NÂNG CẤP', `Tiền: ${s.money}`, '']
    UPGRADES.forEach((u, i) => {
      const lv = G.upgradeLevel(s, u.id)
      lines.push(`[${i + 1}] ${u.name} (cấp ${lv}/${u.costs.length}): ${u.describe(lv)}`)
      lines.push(lv >= u.costs.length ? '       Đã đạt cấp tối đa' : `       Cấp ${lv + 1}: ${u.describe(lv + 1)} - giá ${u.costs[lv]} tiền`)
    })
    lines.push('', this.shopNote, '[U] Xem vật nuôi   [E] hoặc [ESC] để đóng')
    return lines.join('\n')
  }

  // Trang vật nuôi: mỗi loài một phím số; hiện giá, thời gian ra sản phẩm, số chỗ và trạng thái khóa.
  private animalsText() {
    const s = this.state
    const lines = ['VẬT NUÔI', `Tiền: ${s.money}   Chuồng: ${G.homeCount(s, 'pen')}/${G.penCapacity(s)}   Thả rông: ${G.homeCount(s, 'free')}/${G.freeCapacity(s)}`, '']
    ANIMAL_KINDS.forEach((kind, i) => {
      const def = ANIMALS[kind]
      const product = ITEMS[def.product]
      const info = `giá ${def.price}, ra ${product.name.toLowerCase()} sau ${def.produceMs / 1000} giây (bán ${product.sellPrice})`
      if (G.isAnimalBuyable(s, kind)) lines.push(`[${i + 1}] Mua ${def.name}: ${info}`)
      else lines.push(`     ${def.name}: ${info} - chưa mở: ${def.unlock ? unlockText(def.unlock) : ''}`)
    })
    lines.push('', 'Thức ăn mua ở tab Vật phẩm; bấm E một lần ở nơi nuôi là cả nhóm được ăn, chờ rồi nhặt sản phẩm đem bán.')
    lines.push(this.shopNote, '[U] Quay lại cửa hàng   [E] hoặc [ESC] để đóng')
    return lines.join('\n')
  }

  private shopText() {
    if (this.shopPage === 'upgrades') return this.upgradesText()
    if (this.shopPage === 'animals') return this.animalsText()
    const s = this.state
    const buyables = this.buyables()
    const lines = ['CỬA HÀNG', `Tiền: ${s.money}`, '']
    buyables.forEach((id, i) =>
      lines.push(`[${i + 1}] Mua ${ITEMS[id].name} (${ITEMS[id].buyPrice} tiền, đang có ${G.count(s, id)})`),
    )
    // Hàng chưa mở khóa: hiện để người chơi biết mục tiêu, không có phím.
    for (const id of Object.keys(ITEMS)) {
      const item = ITEMS[id]
      if (item.buyPrice !== undefined && !G.isBuyable(s, id) && item.unlock) {
        lines.push(`     ${item.name} (${item.buyPrice} tiền) - chưa mở: ${unlockText(item.unlock)}`)
      }
    }
    const produce = Object.keys(ITEMS)
      .filter((id) => ITEMS[id].sellPrice !== undefined && G.count(s, id) > 0)
      .map((id) => `${ITEMS[id].name} x${G.count(s, id)}`)
    lines.push(`[${buyables.length + 1}] Bán toàn bộ nông sản${produce.length ? ' (' + produce.join(', ') + ')' : ''}`)

    const q = G.currentQuest(s)
    lines.push('')
    if (q) {
      lines.push(`[${buyables.length + 2}] Giao đơn hàng: ${q.title}`)
      lines.push(`     Cần: ${this.questProgressText(q)}`)
      lines.push(`     Thưởng: ${q.rewardMoney} tiền${q.rewardNote ? ', ' + q.rewardNote : ''}`)
    } else {
      lines.push('Bạn đã hoàn thành mọi đơn hàng hiện có!')
    }
    lines.push('', this.shopNote, '[U] Xem nâng cấp   [E] hoặc [ESC] để đóng')
    return lines.join('\n')
  }

  // Bảng chữ có nền khung; cửa hàng và nhà kho vẽ bằng ShopUI (chữ vẫn được ghi vào this.panel để kiểm thử/bàn phím).
  private setPanel(text: string, visible: boolean) {
    this.panel.setText(text)
    const order = visible && this.mode === 'dialog' && this.orderModel !== null
    const gfx = visible && (this.mode === 'shop' || this.mode === 'warehouse' || this.mode === 'kitchen')
    this.panel.setVisible(visible && !gfx && !order)
    this.panelBg.setVisible(visible && !gfx && !order)
    if (order) this.orderUi.render(this.orderModel!)
    else this.orderUi.hide()
    if (gfx) this.shopUi.render(this.shopModel())
    else {
      this.shopUi.hide()
      if (visible && !order) this.panelBg.setSize(this.panel.width + 40, this.panel.height + 28)
    }
  }

  private openPanel(mode: Exclude<Mode, 'play'>, text: string) {
    this.hud.toggleInventory(false)
    this.mode = mode
    this.setPanel(text, true)
  }

  private closePanel() {
    this.mode = 'play'
    this.orderModel = null
    this.setPanel('', false)
  }

  // Nút "Xong": đóng bảng đang mở, hoặc đóng túi đồ.
  private pressDone() {
    sfx('click')
    if (this.mode !== 'play') this.closePanel()
    else this.hud.toggleInventory(false)
  }

  // Nút thư: xem đơn hàng hiện tại.
  private openMail() {
    if (this.mode !== 'play' || this.transitioning) return
    sfx('click')
    const q = G.currentQuest(this.state)
    const text = q
      ? `ĐƠN HÀNG: ${q.title}\n\nCần: ${this.questProgressText(q)}\nThưởng: ${q.rewardMoney} tiền${q.rewardNote ? ', ' + q.rewardNote : ''}\n\nGiao hàng ở cửa hàng (khu chợ).\n\n[E] hoặc [Xong] để đóng`
      : 'Bạn đã hoàn thành mọi đơn hàng hiện có!\n\n[E] hoặc [Xong] để đóng'
    this.orderModel = q
      ? {
          title: q.title,
          rows: G.questProgress(this.state, q).map((p) => ({ icon: `icon-${p.id}`, name: ITEMS[p.id].name, have: p.have, need: p.need })),
          reward: q.rewardMoney,
          note: 'Giao hàng ở cửa hàng (khu chợ).',
        }
      : { title: '', rows: [], reward: 0, note: '' }
    this.openPanel('dialog', text)
  }

  // Mũi tên và thanh tiến độ trên đối tượng đang ngắm (chỉ ở chế độ chơi).
  private updateMarkers() {
    const t = this.mode === 'play' && !this.transitioning ? this.currentTarget : null
    let top: number | null = null
    let x = 0
    let plotId = ''
    if (t?.kind === 'plot') {
      const def = this.map.plots.find((d) => d.id === t.id)
      const v = this.views.get(t.id)
      if (def && v) {
        x = cx(def.col)
        top = v.plant.visible ? cy(def.row) + TILE / 2 - v.plant.displayHeight : cy(def.row) - TILE / 2 + 8
        plotId = t.id
      }
    } else if (t?.kind === 'animal') {
      const v = this.animalViews.get(t.id)
      if (v) {
        x = v.sprite.x
        top = v.sprite.y - v.sprite.displayHeight * 0.92
      }
    } else if (t?.kind === 'npc' && this.map.npc) {
      x = cx(this.map.npc.col)
      top = cy(this.map.npc.row) + TILE / 2 - 100
    } else if (t?.kind === 'prop') {
      x = (t.prop.col + t.prop.w / 2) * TILE
      top = (t.prop.row + t.prop.h) * TILE - 120
    } else if (t?.kind === 'sign') {
      const sg = this.map.signs.find((d) => d.zone === t.zone)
      if (sg) {
        x = cx(sg.col)
        top = cy(sg.row) + TILE / 2 - 60
      }
    }
    this.arrow.setVisible(top !== null)
    if (top !== null) this.arrow.setPosition(x, top - 16 + Math.sin(this.time.now / 160) * 4)

    // Thanh tiến độ trên ô đang trồng/nuôi cá: biểu tượng sản phẩm, thời gian còn lại (hoặc "Cần tưới") và thanh.
    const p = plotId ? this.state.plots[plotId] : null
    const showTip = top !== null && !!p && p.planted && !G.isReady(p)
    for (const o of this.tipObjs) (o as unknown as { setVisible(v: boolean): void }).setVisible(showTip)
    if (showTip && p && top !== null) {
      const crop = CROPS[p.crop]
      const secs = Math.ceil((crop.growMs - p.growMs) / (1000 * G.growthMultiplier(this.state)))
      const cyTip = top - 62
      ;(this.tipObjs[0] as Phaser.GameObjects.Rectangle).setPosition(x, cyTip)
      this.tipIcon.setTexture(`icon-${crop.harvestItem}`).setDisplaySize(24, 24).setPosition(x - 36, cyTip - 5)
      this.tipText.setText(p.watered ? `${secs} giây` : 'Cần tưới').setPosition(x - 20, cyTip - 5)
      ;(this.tipObjs[3] as Phaser.GameObjects.Rectangle).setPosition(x - 42, cyTip + 12)
      this.tipBar.setPosition(x - 42, cyTip + 12).setSize(Math.max(1, 84 * G.growProgress(p)), 7)
    }
  }

  private helpText() {
    return [
      'HƯỚNG DẪN',
      '',
      'WASD / mũi tên: di chuyển',
      'E: tương tác (nói chuyện, trồng, tưới, thu hoạch, mua bán)',
      'Khu chợ: bước qua cổng FARM để vào nông trại; lối ở tường dưới nông trại dẫn về khu chợ',
      'Q: đổi loại hạt giống đang chọn     I hoặc nút menu: mở túi đồ (bấm vào hạt để chọn)',
      'Nút thư: xem đơn hàng (chấm đỏ = đã đủ hàng để giao). Nút Xong: đóng bảng đang mở.',
      'M: bật/tắt âm thanh     H: mở/đóng hướng dẫn',
      'Delete (hai lần): xóa tiến trình và chơi lại',
      '',
      'Vòng chơi: nhận hạt → trồng → tưới → chờ lớn → thu hoạch',
      '→ bán ở cửa hàng khu chợ → mua thêm hạt.',
      'Cây chỉ lớn khi đã tưới và game đang mở.',
      'Nhà bếp (phía trên): nấu nông sản thành thành phẩm giá cao. Nhà kho: xem túi đồ và nâng sức chứa.',
      'Nông trại cuộn ngang: biển MUA ở từng khu để mở rộng (chuồng, nhà bếp, nhà kho, ruộng, hồ cá).',
      'Cửa hàng: ←→ hoặc A D đổi tab, ↓ / S chọn món, ↑ / W lên tab, Enter mua/bán (cũng bấm chuột được).',
      'Mở rộng khu để mở khóa thêm: cà chua (ruộng cấp 1), gà + thức ăn (chăn nuôi cấp 1), vịt và heo (cấp 2), bò (cấp 3).',
      'Gà, vịt thả rông ở bãi cỏ; heo, bò ở trong chuồng; cá nuôi trong hồ (mua cá ở tab Vật nuôi).',
      'Cho ăn: đứng gần nơi nuôi rồi bấm E một lần là cả nhóm được ăn (rải thóc ra đất, đổ cám/cỏ vào máng, rải thức ăn xuống hồ). Mỗi con đói dùng 1 phần thức ăn của loài đó.',
      '',
      '[H] hoặc [ESC] để đóng',
    ].join('\n')
  }

  // Phản hồi khi tương tác: chữ bay lên và (tùy chọn) tia sáng tại ô đất.
  private feedback(plotId: string, text: string, color: string, sparkle: boolean) {
    const def = this.map.plots.find((p) => p.id === plotId)
    if (!def) return
    this.feedbackAt(cx(def.col), cy(def.row) - 10, text, color, sparkle)
  }

  // Chữ bay lên (và tia sáng) tại một điểm bất kỳ theo pixel.
  private feedbackAt(x: number, y: number, text: string, color: string, sparkle: boolean) {
    const t = this.add
      .text(x, y, text, { fontFamily: 'sans-serif', fontSize: '16px', color, stroke: '#000000', strokeThickness: 3 })
      .setOrigin(0.5)
      .setDepth(9000)
    this.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 900, ease: 'Sine.easeOut', onComplete: () => t.destroy() })
    if (!sparkle) return
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      const dot = this.add.circle(x, y, 4, 0xffe27a).setDepth(9000)
      this.tweens.add({
        targets: dot,
        x: x + Math.cos(a) * 34,
        y: y + Math.sin(a) * 34,
        alpha: 0,
        scale: 0.3,
        duration: 600,
        ease: 'Sine.easeOut',
        onComplete: () => dot.destroy(),
      })
    }
  }

  private deliverQuest() {
    const q = G.currentQuest(this.state) // ghi nhớ trước khi giao (giao xong sẽ chuyển sang đơn khác)
    const r = G.deliver(this.state)
    if (r === 'ok' && q) {
      const note = q.rewardNote ? `, ${q.rewardNote}` : ''
      this.shopNote = `Đã giao "${q.title}"! Nhận ${q.rewardMoney} tiền${note}.`
      this.say(`Hoàn thành đơn hàng: ${q.title}`)
      sfx('sell')
      this.save()
    } else if (r === 'not-enough') {
      this.shopNote = 'Bạn chưa đủ hàng để giao đơn này.'
      sfx('error')
    } else if (r === 'no-quest') {
      this.shopNote = 'Không còn đơn hàng nào.'
      sfx('error')
    }
  }

  private openShop() {
    this.shopNote = ''
    this.shopFocus = 'tabs'
    this.shopPage = 'goods'
    this.shopTab = 'seeds'
    this.shopSel = 0
    this.openPanel('shop', this.shopText())
  }

  private actBuyItem(id: string) {
    const r = G.buy(this.state, id)
    this.shopNote = r === 'ok' ? `Đã mua 1 ${ITEMS[id].name}.` : r === 'no-money' ? 'Không đủ tiền.' : r === 'full' ? 'Kho đầy! Hãy bán bớt hoặc nâng cấp nhà kho.' : ''
    sfx(r === 'ok' ? 'buy' : 'error')
    this.save()
  }

  private actSellAll() {
    const gain = G.sellAllProduce(this.state)
    this.shopNote = gain > 0 ? `Đã bán, nhận ${gain} tiền.` : 'Bạn không có nông sản để bán.'
    sfx(gain > 0 ? 'sell' : 'error')
    this.save()
  }

  private actSellItem(id: string) {
    const gain = G.sellAll(this.state, id)
    this.shopNote = gain > 0 ? `Đã bán ${ITEMS[id].name.toLowerCase()}, nhận ${gain} tiền.` : 'Không có gì để bán.'
    sfx(gain > 0 ? 'sell' : 'error')
    this.save()
  }

  private actBuyAnimal(kind: string) {
    const r = G.buyAnimal(this.state, kind)
    this.shopNote =
      r === 'ok'
        ? `Đã mua ${ANIMALS[kind].name.toLowerCase()}. Hãy ra chuồng cho nó ăn!`
        : r === 'no-money'
          ? 'Không đủ tiền.'
          : r === 'full'
            ? 'Chuồng đã hết chỗ.'
            : r === 'locked'
              ? 'Chưa mở khóa vật nuôi này.'
              : ''
    sfx(r === 'ok' ? 'buy' : 'error')
    if (r === 'ok') this.save()
  }

  private actBuyUpgrade(u: (typeof UPGRADES)[number]) {
    const s = this.state
    const r = G.buyUpgrade(s, u.id)
    this.shopNote =
      r === 'ok' ? `Đã nâng cấp ${u.name} lên cấp ${G.upgradeLevel(s, u.id)}.` : r === 'no-money' ? 'Không đủ tiền.' : r === 'max-level' ? `${u.name} đã đạt cấp tối đa.` : ''
    sfx(r === 'ok' ? 'buy' : 'error')
    if (r === 'ok') this.save()
  }

  // Nội dung của tab đang chọn: danh sách ô (mỗi ô có chi tiết + nút) và các nút chung của tab.
  private shopEntries(): { entries: ShopEntry[]; extra: ShopEntry['buttons']; empty: string[] } {
    const s = this.state
    const entries: ShopEntry[] = []
    let extra: ShopEntry['buttons'] = []
    let empty: string[] = []
    const lockedText = (u?: Unlock) => `Chưa mở: ${u ? unlockText(u) : ''}`
    const itemEntry = (id: string): ShopEntry => {
      const it = ITEMS[id]
      const have = G.count(s, id)
      const buyable = G.isBuyable(s, id)
      const locked = it.buyPrice !== undefined && !buyable && !!it.unlock
      const crop = CROPS[id]
      const lines = [it.name, locked ? lockedText(it.unlock) : `Giá: ${it.buyPrice} tiền`]
      if (crop) lines.push(`Lớn sau ${crop.growMs / 1000} giây`)
      lines.push(`Đang có: ${have}`)
      return {
        card: { icon: `icon-${id}`, badge: have > 0 ? String(have) : undefined, dim: locked },
        lines: lines.slice(0, 4),
        buttons: [{ label: 'Mua', enabled: buyable, run: () => this.actBuyItem(id) }],
      }
    }
    const tab = this.mode === 'warehouse' ? 'storage' : this.mode === 'kitchen' ? 'kitchen' : this.shopTab
    if (tab === 'kitchen') {
      const free = G.kitchenFreeSlot(s) >= 0
      for (const rc of RECIPES) {
        const enough = Object.entries(rc.inputs).every(([id, n]) => G.count(s, id) >= n)
        const need = Object.entries(rc.inputs).map(([id, n]) => `${ITEMS[id].name} ${G.count(s, id)}/${n}`).join(', ')
        entries.push({
          card: { icon: `icon-${rc.output}`, dim: !enough },
          lines: [rc.name, `Cần: ${need}`, `Nấu ${rc.cookMs / 1000} giây, bán ${ITEMS[rc.output].sellPrice} tiền`, `Bếp: đang nấu ${G.kitchenBusyCount(s)}/${G.kitchenSlots(s)} mẻ`],
          buttons: [{ label: free ? 'Nấu' : 'Bếp bận', enabled: free && enough, run: () => this.cookRecipe(rc) }],
        })
      }
    } else if (tab === 'seeds') {
      for (const id of Object.keys(ITEMS)) if (id.startsWith('seed_') && ITEMS[id].buyPrice !== undefined) entries.push(itemEntry(id))
      empty = ['Hiện chưa có hạt giống nào.']
    } else if (tab === 'items') {
      for (const id of Object.keys(ITEMS)) if (!id.startsWith('seed_') && ITEMS[id].buyPrice !== undefined) entries.push(itemEntry(id))
      for (const u of UPGRADES) {
        const lv = G.upgradeLevel(s, u.id)
        const max = u.costs.length
        entries.push({
          card: { icon: 'ui_arrow_up_green', badge: `${lv}/${max}` },
          lines: [`${u.name} (cấp ${lv}/${max})`, `Hiện tại: ${u.describe(lv)}`, lv >= max ? 'Đã đạt cấp tối đa' : `Cấp ${lv + 1}: ${u.describe(lv + 1)}`, lv >= max ? '' : `Giá: ${u.costs[lv]} tiền`].filter((l) => l !== ''),
          buttons: [{ label: lv >= max ? 'Tối đa' : 'Nâng cấp', enabled: lv < max, run: () => this.actBuyUpgrade(u) }],
        })
      }
    } else if (tab === 'animals') {
      for (const kind of ANIMAL_KINDS) {
        const def = ANIMALS[kind]
        const buyable = G.isAnimalBuyable(s, kind)
        entries.push({
          card: { icon: `${def.texture}_idle_1`, dim: !buyable },
          lines: [def.name, `Giá: ${def.price} tiền`, `Sản phẩm: ${ITEMS[def.product].name} (sau ${def.produceMs / 1000} giây)`, buyable ? `${def.home === 'free' ? 'Thả rông' : def.home === 'pond' ? 'Hồ cá' : 'Chuồng'}: ${G.homeCount(s, def.home)}/${G.homeCapacity(s, def.home)} chỗ` : lockedText(def.unlock)],
          buttons: [{ label: 'Mua', enabled: buyable, run: () => this.actBuyAnimal(kind) }],
        })
      }
    } else if (tab === 'sell') {
      for (const id of Object.keys(ITEMS)) {
        const it = ITEMS[id]
        const n = G.count(s, id)
        if (it.sellPrice === undefined || n <= 0) continue
        entries.push({
          card: { icon: `icon-${id}`, badge: String(n) },
          lines: [it.name, `Số lượng: ${n}`, `Thu nhập: ${n * it.sellPrice} tiền (${it.sellPrice}/cái)`, `Tiền hiện có: ${s.money}`],
          buttons: [{ label: 'Bán', enabled: true, run: () => this.actSellItem(id) }],
        })
      }
      const q = G.currentQuest(s)
      empty = ['Chưa có hàng để bán.', `Tiền hiện có: ${s.money}`]
      if (q) {
        empty.push(`Đơn: ${q.title}`, `Cần: ${this.questProgressText(q)}`)
        extra = [{ label: 'Giao đơn', enabled: true, run: () => this.deliverQuest() }]
      }
    } else {
      for (const id of Object.keys(ITEMS)) {
        const n = G.count(s, id)
        if (n <= 0) continue
        const it = ITEMS[id]
        entries.push({
          card: { icon: `icon-${id}`, badge: String(n) },
          lines: [it.name, `Số lượng: ${n}`, it.sellPrice !== undefined ? `Giá bán: ${it.sellPrice} tiền` : 'Không bán được', `Sức chứa: ${G.totalItems(s)}/${G.capacity(s)}`],
          buttons: [],
        })
      }
      empty = ['Nhà kho', `Sức chứa: ${G.totalItems(s)}/${G.capacity(s)} vật phẩm`, 'Kho trống.']
      const cost = G.zoneCost(s, 'warehouse')
      extra = [{ label: cost === null ? 'Tối đa' : `Mở rộng ${cost}`, enabled: cost !== null, run: () => this.expandWarehouse() }]
    }
    return { entries, extra, empty }
  }

  private shopContent() {
    const { entries, extra, empty } = this.shopEntries()
    this.shopSel = Math.max(0, Math.min(this.shopSel, entries.length - 1))
    return { entries, extra, empty, entry: entries[this.shopSel] as ShopEntry | undefined }
  }

  private shopModel(): ShopModel {
    const { entries, extra, empty, entry } = this.shopContent()
    const warehouse = this.mode === 'warehouse'
    const kitchen = this.mode === 'kitchen'
    return {
      tabs: kitchen
        ? [{ id: 'kitchen', label: 'Nhà bếp' }]
        : warehouse
        ? [{ id: 'storage', label: 'Kho' }]
        : [
            { id: 'seeds', label: 'Giống' },
            { id: 'animals', label: 'Vật nuôi' },
            { id: 'items', label: 'Vật phẩm' },
            { id: 'sell', label: 'Kho hàng' },
            { id: 'storage', label: 'Kho' },
          ],
      tab: kitchen ? 'kitchen' : warehouse ? 'storage' : this.shopTab,
      cards: entries.map((e) => e.card),
      selected: entry ? this.shopSel : -1,
      lines: entry ? entry.lines : empty,
      buttons: [...(entry?.buttons ?? []), ...extra].map((b) => ({ label: b.label, enabled: b.enabled })),
      note: this.shopNote,
      focus: this.shopFocus,
      hint: '←→/AD: tab · ↓/S: chọn món · ↑/W: lên tab · Enter: Mua/Bán · F: nút phụ · E: đóng',
    }
  }

  private selectTab(id: ShopTab) {
    if (this.mode !== 'shop' || id === this.shopTab) return
    this.shopTab = id
    this.shopPage = TAB_PAGE[id]
    this.shopSel = 0
    this.shopNote = ''
    sfx('click')
  }

  // Điều khiển bàn phím cho bảng cửa hàng / nhà kho / nhà bếp: ←→ hoặc A D đổi tab (hoặc chọn ô khi đang ở lưới),
  // ↓ hoặc S xuống lưới, ↑ hoặc W lên hàng tab, Enter / Space bấm nút chính, F bấm nút phụ.
  private shopNav() {
    const jd = Phaser.Input.Keyboard.JustDown
    const left = jd(this.cursors.left) || jd(this.keys.A)
    const right = jd(this.cursors.right) || jd(this.keys.D)
    const up = jd(this.cursors.up) || jd(this.keys.W)
    const down = jd(this.cursors.down) || jd(this.keys.S)
    const { entries, extra, entry } = this.shopContent()
    const COLS = 6
    if (this.shopFocus === 'tabs') {
      if (left || right) {
        const ids = this.shopModel().tabs.map((t) => t.id as ShopTab)
        const i = ids.indexOf(this.shopTab)
        this.selectTab(ids[Math.max(0, Math.min(ids.length - 1, i + (right ? 1 : -1)))])
      }
      if (down && entries.length > 0) {
        this.shopFocus = 'grid'
        sfx('click')
      }
    } else {
      let sel = this.shopSel
      if (left) sel = Math.max(0, sel - 1)
      if (right) sel = Math.min(entries.length - 1, sel + 1)
      if (down && sel + COLS < entries.length) sel += COLS
      if (up) {
        if (sel < COLS) this.shopFocus = 'tabs'
        else sel -= COLS
      }
      if (sel !== this.shopSel || up || (down && sel === this.shopSel)) sfx('click')
      this.shopSel = sel
    }
    const buttons = [...(entry?.buttons ?? []), ...extra]
    const press = (i: number) => {
      const b = buttons[i]
      if (!b) return
      if (b.enabled) b.run()
      else {
        this.shopNote = 'Chưa thể thực hiện.'
        sfx('error')
      }
    }
    if (jd(this.keys.ENTER) || jd(this.keys.SPACE)) press(0)
    if (jd(this.keys.F)) press(1)
  }

  private updateShop() {
    this.shopNav()
    if (Phaser.Input.Keyboard.JustDown(this.keys.U)) {
      // Xoay vòng ba trang: cửa hàng -> nâng cấp -> vật nuôi -> cửa hàng.
      this.shopPage = this.shopPage === 'goods' ? 'upgrades' : this.shopPage === 'upgrades' ? 'animals' : 'goods'
      this.shopTab = this.shopPage === 'goods' ? 'seeds' : this.shopPage === 'upgrades' ? 'items' : 'animals'
      this.shopSel = 0
      this.shopNote = ''
      sfx('click')
    }
    // Phím số chỉ có tác dụng khi tab đang hiện khớp với trang phím tắt.
    const tabMatches = TAB_PAGE[this.shopTab] === this.shopPage && (this.shopPage !== 'goods' || this.shopTab === 'seeds')
    if (this.shopPage === 'animals') {
      const keys = [this.keys.ONE, this.keys.TWO, this.keys.THREE, this.keys.FOUR]
      const i = keys.findIndex((k) => Phaser.Input.Keyboard.JustDown(k))
      if (tabMatches && i >= 0 && i < ANIMAL_KINDS.length) this.actBuyAnimal(ANIMAL_KINDS[i])
      this.setPanel(this.shopText(), true)
      return
    }
    if (this.shopPage === 'upgrades') {
      const keys = [this.keys.ONE, this.keys.TWO, this.keys.THREE]
      const i = keys.findIndex((k) => Phaser.Input.Keyboard.JustDown(k))
      if (tabMatches && i >= 0 && i < UPGRADES.length) this.actBuyUpgrade(UPGRADES[i])
      this.setPanel(this.shopText(), true)
      return
    }
    const buyables = this.buyables()
    // Phím 1..n: mua theo thứ tự; tiếp theo: bán toàn bộ nông sản; tiếp theo: giao đơn hàng (tối đa 5 phím).
    const shopKeys = [this.keys.ONE, this.keys.TWO, this.keys.THREE, this.keys.FOUR, this.keys.FIVE]
    const pressed = shopKeys.findIndex((k) => Phaser.Input.Keyboard.JustDown(k))
    if (tabMatches && pressed >= 0 && pressed < buyables.length) this.actBuyItem(buyables[pressed])
    else if (tabMatches && pressed === buyables.length) this.actSellAll()
    else if (tabMatches && pressed === buyables.length + 1) this.deliverQuest()
    this.setPanel(this.shopText(), true)
  }

  private updateReset() {
    if (!Phaser.Input.Keyboard.JustDown(this.keys.DEL)) return
    if (this.time.now < this.resetArmedUntil) {
      clearSave()
      this.scene.restart()
    } else {
      this.resetArmedUntil = this.time.now + 3000
      this.say('Nhấn Delete lần nữa trong 3 giây để XÓA toàn bộ tiến trình.')
    }
  }

  // Bước vào ô cửa thì chuyển bản đồ.
  private checkDoor() {
    const c = Math.floor(this.state.player.col)
    const r = Math.floor(this.state.player.row)
    const door = this.map.doors.find((d) => d.col === c && d.row === r)
    if (door) this.travel(door.to, door.spawn)
  }

  // Mờ dần, đổi bản đồ (giữ trạng thái trong bộ nhớ), sáng dần. Khóa điều khiển trong lúc chuyển.
  private travel(to: string, spawn: { col: number; row: number }) {
    if (this.transitioning || !MAPS[to]) return
    this.transitioning = true
    sfx('click')
    this.cameras.main.fadeOut(FADE_MS, 0, 0, 0)
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.state.map = to
      this.state.player = { col: spawn.col, row: spawn.row }
      this.save()
      this.scene.restart({ state: this.state })
    })
  }

  update(_time: number, delta: number) {
    const dtMs = Math.min(delta, MAX_DT_MS)
    const dt = dtMs / 1000
    const kb = Phaser.Input.Keyboard

    this.updateReset()
    if (kb.JustDown(this.keys.M)) {
      resumeAudio()
      this.say(toggleMute() ? 'Đã tắt âm thanh.' : 'Đã bật âm thanh.')
    }
    const helpPressed = kb.JustDown(this.keys.H)

    // Hội thoại/cửa hàng/hướng dẫn: khóa di chuyển và tương tác; E/ESC (và H với hướng dẫn) đóng.
    let moving = false
    this.currentTarget = null
    if (this.transitioning) {
      this.hint.setText('')
    } else if (this.mode !== 'play') {
      if (this.mode === 'shop') this.updateShop()
      else if (this.mode === 'kitchen') this.updateKitchen()
      else if (this.mode === 'warehouse') this.updateWarehouse()
      const close = kb.JustDown(this.keys.E) || kb.JustDown(this.keys.ESC) || (this.mode === 'help' && helpPressed)
      if (close) this.closePanel()
      this.hint.setText('')
    } else if (helpPressed) {
      this.openPanel('help', this.helpText())
    } else {
      moving = this.movePlayer(dt)
      this.checkDoor()
      if (kb.JustDown(this.keys.Q)) this.cycleSeed()
      if (kb.JustDown(this.keys.I)) this.hud.toggleInventory()
      if (kb.JustDown(this.keys.ESC) && this.hud.inventoryOpen) this.hud.toggleInventory(false)
      const target = this.findTarget()
      this.currentTarget = target
      this.hint.setText(this.describe(target))
      if (target && kb.JustDown(this.keys.E)) this.interact(target)
    }

    this.ensureSeed() // mọi chế độ: nhận/mua hạt trong hội thoại hoặc cửa hàng cũng cập nhật hạt đang chọn
    this.animatePlayer(moving)
    if (!this.transitioning && G.tickTime(this.state, dtMs)) {
      this.say(`Đã qua nửa đêm! Sang ngày ${this.state.day}.`)
      this.save()
    }
    G.tick(this.state, dtMs) // cây ở mọi bản đồ vẫn lớn khi người chơi đang ở bản đồ khác
    this.render()
  }

  // Chọn animation theo trạng thái thật: đi bộ theo hướng nhìn, hoặc đứng yên ở frame idle.
  private animatePlayer(moving: boolean) {
    this.player.setFlipX(this.facing === 'side' && this.facingRight !== SIDE_FACES_RIGHT)
    if (moving) {
      this.player.anims.play(`player-walk-${this.facing}`, true)
    } else {
      this.player.anims.stop()
      this.player.setTexture(IDLE_FRAME[this.facing])
    }
  }

  // Trả về true nếu người chơi đang nhấn phím di chuyển.
  private movePlayer(dt: number): boolean {
    const s = this.state
    let ix = 0
    let iy = 0
    if (this.cursors.left.isDown || this.keys.A.isDown) ix -= 1
    if (this.cursors.right.isDown || this.keys.D.isDown) ix += 1
    if (this.cursors.up.isDown || this.keys.W.isDown) iy -= 1
    if (this.cursors.down.isDown || this.keys.S.isDown) iy += 1
    if (ix === 0 && iy === 0) return false

    // Hướng nhìn: ngang ưu tiên khi đi chéo.
    if (ix !== 0) {
      this.facing = 'side'
      this.facingRight = ix > 0
    } else {
      this.facing = iy > 0 ? 'down' : 'up'
    }

    // Chuẩn hóa để đi chéo không nhanh hơn đi thẳng; đổi pixel/giây sang ô/giây.
    const len = Math.hypot(ix, iy)
    const step = (SPEED_PX / TILE) * dt
    const dCol = (ix / len) * step
    const dRow = (iy / len) * step

    // Từng trục để trượt dọc vật cản.
    if (!this.isBlocked(s.player.col + dCol, s.player.row)) s.player.col += dCol
    if (!this.isBlocked(s.player.col, s.player.row + dRow)) s.player.row += dRow
    return true
  }

  // Vẽ lại từ GameState (UI phản ánh trạng thái).
  private render() {
    const s = this.state
    const px = s.player.col * TILE
    const py = s.player.row * TILE
    this.player.setPosition(px, py).setDepth(py)
    this.nameTag.setPosition(px, py - PLAYER_SIZE - 6)

    for (const def of this.map.plots) {
      const v = this.views.get(def.id)!
      const p = s.plots[def.id]
      const unlocked = this.plotUnlocked(def)
      v.tile.setVisible(unlocked) // ô đất chưa mở thì ẩn
      if (!unlocked) {
        v.plant.setVisible(false)
        continue
      }
      v.tile.setTexture(p.planted && p.watered ? 'plot-wet' : 'plot-dry')
      if (!p.planted) {
        v.plant.setVisible(false)
        continue
      }
      const prog = G.growProgress(p)
      v.plant.setVisible(true)
      const art = CROPS[p.crop]
      this.setPlantArt(v.plant, G.isReady(p) ? art.readyArt : prog < 0.3 ? art.seedArt : prog < 0.65 ? art.sproutArt : art.growArt)
    }

    // Vật nuôi theo GameState: hiện đúng loài; bong bóng báo đói (thức ăn) hoặc có sản phẩm.
    for (const slot of this.map.animalSlots) {
      const v = this.animalViews.get(slot.id)
      const a = s.animals[slot.id]
      if (!v || !a) continue
      const def = ANIMALS[a.kind]
      if (!def) {
        v.sprite.setVisible(false)
        v.bubble.setVisible(false)
        v.barBg.setVisible(false)
        v.bar.setVisible(false)
        continue
      }
      if (a.fed && !v.wasFed) v.eatUntil = this.time.now + 2600 // vừa được cho ăn: cúi xuống ăn một lúc
      v.wasFed = a.fed
      const eating = !v.moving && v.home !== 'pond' && this.time.now < v.eatUntil
      const frame = eating ? `${def.texture}_eat_${(Math.floor(this.time.now / 320) % 2) + 1}` : v.moving ? `${def.texture}_walk_${(Math.floor(this.time.now / (v.home === 'pond' ? 70 : 140)) % 4) + 1}` : `${def.texture}_idle_${(Math.floor(this.time.now / 500) % 2) + 1}`
      v.sprite.setTexture(frame).setVisible(true)
      // Cá lớn dần: cá con (nhỏ) khi mới thả/mới vớt, to hết cỡ khi đã chín.
      const growth = a.fed ? G.animalProgress(a) : 0
      if (v.home === 'pond') v.sprite.setScale((def.size / v.sprite.frame.width) * (0.5 + 0.5 * growth))
      else v.sprite.setDisplaySize(def.size, def.size)
      v.bubble.setPosition(v.sprite.x, v.sprite.y - (v.home === 'pond' ? 30 : 56))
      const growing = a.fed && growth < 1
      v.barBg.setVisible(growing)
      v.bar.setVisible(growing)
      if (growing) {
        const by = v.sprite.y - (v.home === 'pond' ? v.sprite.displayHeight / 2 + 8 : v.sprite.displayHeight * 0.92 + 6)
        v.barBg.setPosition(v.sprite.x - ANIMAL_BAR_W / 2, by)
        v.bar.setPosition(v.sprite.x - ANIMAL_BAR_W / 2, by).setSize(Math.max(1, ANIMAL_BAR_W * growth), 5)
      }
      const ready = G.animalReady(a)
      const hungry = !a.fed
      v.bubble.setVisible(ready || hungry)
      if (ready) v.bubble.setTexture(`icon-${def.product}`)
      else if (hungry) v.bubble.setTexture(`icon-${def.feed}`)
    }

    for (const nv of this.nestViews) {
      const c = s.nests[nv.item] ?? 0
      if (c === nv.count) continue
      nv.count = c
      nv.eggs.forEach((e, i) => e.setVisible(i < Math.min(c, 6)))
      nv.label.setText(`x${c}`).setVisible(c > 0)
    }
    this.drawTrough()
    this.hud.update({
      money: s.money,
      inventory: s.inventory,
      selectedSeed: this.selectedSeed,
      stock: `${G.totalItems(s)}/${G.capacity(s)}`,
      day: s.day,
      clock: clockText(s.time),
      mailAlert: (() => {
        const mq = G.currentQuest(s)
        return !!mq && G.questProgress(s, mq).every((pr) => pr.have >= pr.need)
      })(),
      showDone: this.mode !== 'play' || this.hud.inventoryOpen,
    })
    this.updateMarkers()

    // Ánh sáng theo giờ (không áp dụng trong nhà); đom đóm chỉ hiện khi trời tối.
    const hour = hourOf(s.time)
    const lit = lightAt(hour)
    this.light.setFillStyle(lit.color, lit.alpha)
    const nightness = Math.max(0, Math.min(1, (hour - 19.5) / 1.5))
    for (const f of this.fireflies) f.setAlpha(nightness * 0.9)
    const q = G.currentQuest(s)
    if (!q) this.questText.setText('Đã hoàn thành mọi đơn hàng!')
    else {
      const ready = G.questProgress(s, q).every((p) => p.have >= p.need)
      this.questText.setText(`Đơn hàng: ${q.title}\n${this.questProgressText(q)}${ready ? ' - đủ rồi, đến giao!' : ''}`)
    }
    this.hudRight.setText(`${this.map.name}   H: hướng dẫn   M: âm thanh ${isMuted() ? 'TẮT' : 'BẬT'}`)
  }
}
