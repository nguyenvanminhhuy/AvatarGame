import Phaser from 'phaser'
import { HUB_SCALE, OBJ_SCALE, env } from '../art'
import { TILE, buildingSpot, type MapDef, type Rect } from '../data/world'

// Dựng phần hình tĩnh của một bản đồ từ bộ pixel-art 4x: phông trời + cây xa, nền đất/cỏ, lô cỏ viền bo, chuồng, hồ,
// công trình, vật thể khu chợ, biển MUA, tường đá + hoa. Quy ước độ sâu: depth = y của chân vật thể (đi trước/sau đúng);
// nền dưới 0. PlayScene tự vẽ phần động (ô đất, cây, vật nuôi, nhân vật).

const S = 0.25 // ô môi trường 128 px -> 32 px
const hash = (c: number, r: number) => (((c * 73856093) ^ (r * 19349663)) >>> 0)

export interface MapViewOptions {
  npcLabelDepth?: number
}

function tile(scene: Phaser.Scene, col: number, row: number, name: string, depth: number, dx = 0, dy = 0) {
  return scene.add.image(col * TILE + dx, row * TILE + dy, 'env', env(name)).setOrigin(0, 0).setScale(S).setDepth(depth)
}

// Khung 3x3 ô (góc + cạnh + giữa) phủ hình chữ nhật pixel x,y,w,h; góc cố định 32 px, cạnh và giữa giãn.
function ninePatch(scene: Phaser.Scene, base: string, x: number, y: number, w: number, h: number, depth: number) {
  const names = [
    ['_tl', '_t', '_tr'],
    ['_l', '_c', '_r'],
    ['_bl', '_b', '_br'],
  ]
  const xs = [x, x + TILE, x + w - TILE]
  const ws = [TILE, w - 2 * TILE, TILE]
  const ys = [y, y + TILE, y + h - TILE]
  const hs = [TILE, h - 2 * TILE, TILE]
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 3; i++) {
      if (ws[i] <= 0 || hs[j] <= 0) continue
      scene.add.image(xs[i], ys[j], 'env', env(base + names[j][i])).setOrigin(0, 0).setDisplaySize(ws[i], hs[j]).setDepth(depth)
    }
  }
}

function patchRect(scene: Phaser.Scene, base: string, r: Rect, inflate: number, depth: number) {
  ninePatch(scene, base, r.col * TILE - inflate, r.row * TILE - inflate, r.w * TILE + 2 * inflate, r.h * TILE + 2 * inflate, depth)
}

// Ảnh vật thể cắt sát: neo ở giữa-đáy tại (x, footY), vẽ theo tỷ lệ scale của file 4x.
function obj(scene: Phaser.Scene, key: string, x: number, footY: number, scale = OBJ_SCALE, depth = footY) {
  return scene.add.image(x, footY, key).setOrigin(0.5, 1).setScale(scale).setDepth(depth)
}

function backdrop(scene: Phaser.Scene, m: MapDef, mw: number) {
  const skyRows = m.skyRows
  const footY = skyRows * TILE
  // Trời: dải màu xanh nhạt dần xuống chân trời.
  const skyH = (skyRows - 3) * TILE
  const bands = 6
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1)
    const color = Phaser.Display.Color.Interpolate.ColorWithColor(new Phaser.Display.Color(110, 190, 240), new Phaser.Display.Color(190, 228, 248), 1, t)
    scene.add.rectangle(mw / 2, (skyH / bands) * (i + 0.5), mw, skyH / bands + 1, Phaser.Display.Color.GetColor(color.r, color.g, color.b)).setDepth(-4)
  }
  // Mây.
  const clouds = ['cloud_fluffy', 'cloud_flat', 'cloud_small']
  for (let x = 40, i = 0; x < mw; x += 230 + (i % 3) * 40, i++) {
    scene.add.image(x, 22 + ((i * 37) % 60), 'env', env(clouds[i % 3])).setOrigin(0, 0).setScale(0.55).setDepth(-3.9)
  }
  // Đồi xa: hai hàng ô (mép đồi + nền), cây xa và hàng rào xa; phía dưới là dải cỏ sát nền chơi.
  for (let c = 0; c < m.cols; c++) {
    tile(scene, c, skyRows - 3, c % 2 ? 'far_meadow_top_a' : 'far_meadow_top_b', -3.8)
    tile(scene, c, skyRows - 2, 'far_meadow_fill', -3.8)
    tile(scene, c, skyRows - 1, hash(c, 1) % 2 ? 'grass_a' : 'grass_b', -3.7)
  }
  const trees = ['far_tree_hazy_a', 'far_tree_hazy_b', 'far_tree_clear_a', 'far_tree_clear_b']
  for (let x = 6, i = 0; x < mw; x += 52 + (hash(i, 3) % 24), i++) {
    scene.add.image(x, (skyRows - 2) * TILE + 6, 'env', env(trees[hash(i, 7) % 4])).setOrigin(0.5, 1).setScale(0.42).setDepth(-3.7)
  }
  for (let x = 0, i = 0; x < mw; x += 96, i++) {
    if (i % 3 === 1) continue
    scene.add.image(x, (skyRows - 2) * TILE + 18, 'env', env('far_fence_3posts')).setOrigin(0, 1).setScale(0.3).setDepth(-3.6)
  }
  return footY
}

export function buildMapView(scene: Phaser.Scene, m: MapDef) {
  const mw = m.cols * TILE
  const mh = m.rows * TILE
  const footY = backdrop(scene, m, mw)

  // Nền chơi: đất, cỏ ở khu chợ.
  const isHub = m.id === 'hub'
  for (let r = m.skyRows; r < m.rows; r++) {
    for (let c = 0; c < m.cols; c++) {
      let name = hash(c, r) % 2 ? 'dirt_a' : 'dirt_b'
      if (isHub) {
        const onPath = (r >= 13 && r <= 14) || (c >= 10 && c <= 12 && r >= 10)
        name = onPath ? name : hash(c, r) % 2 ? 'grass_a' : 'grass_b'
      }
      tile(scene, c, r, name, -3)
    }
  }
  // Hoa dại rải trên cỏ khu chợ.
  if (isHub) {
    for (let r = m.skyRows; r < m.rows; r++) {
      for (let c = 0; c < m.cols; c++) {
        const h = hash(c, r)
        const onPath = (r >= 13 && r <= 14) || (c >= 10 && c <= 12 && r >= 10)
        if (!onPath && h % 11 === 0 && r !== 10 && r !== 11) scene.add.image(c * TILE + 16, r * TILE + 28, 'env', env('wildflowers')).setOrigin(0.5, 1).setScale(0.22).setDepth(-2.5)
      }
    }
  }

  // Lô cỏ viền bo: nền ruộng, sân chuồng, bãi cỏ. Mở rộng 16 px ra ngoài để viền nằm quanh các ô đất.
  for (const lot of m.lots) patchRect(scene, 'grass_plot', lot, 16, -2.9)
  if (m.pen) patchRect(scene, 'grass_plot', m.pen, 8, -2.9)

  // Hai dải lúa chín hai bên nông trại (mỗi bên một cột).
  if (!isHub) {
    for (let r = m.skyRows; r < m.rows - 1; r++) {
      tile(scene, 0, r, hash(0, r) % 2 ? 'wheat_strip_a' : 'wheat_strip_b', -2.5)
      for (let c = m.cols - 1; c < m.cols; c++) tile(scene, c, r, hash(c, r) % 2 ? 'wheat_strip_a' : 'wheat_strip_b', -2.5)
    }
  }

  // Hồ cá: bãi cỏ trong sân, mặt nước viền bo, sóng và lá sen; hàng rào bao quanh sân (chừa cổng bên trái).
  if (m.pond && m.pondYard && m.pondGate) {
    const p = m.pond
    const y = m.pondYard
    patchRect(scene, 'grass_plot', { col: y.col + 1, row: y.row + 1, w: y.w - 2, h: y.h - 2 }, 0, -2.95)
    patchRect(scene, 'pond', p, 6, -2.8) // viền nước nhô ra 6 px, vẫn nằm trong bờ cỏ 32 px của sân
    for (const [dc, dr, name, sc] of [[0.2, 0.2, 'lily_pad_large', 0.3], [2.3, 0.9, 'lily_pad_small', 0.3], [0.3, 2.9, 'lotus_bud_open', 0.3], [2.2, 2.6, 'lily_pad_large', 0.28], [1.2, 3.3, 'lotus_bud_closed', 0.28]] as const) {
      if (dr > p.h - 0.7) continue // hồ chưa mở rộng: không vẽ lá sen ngoài mặt nước
      scene.add.image((p.col + 0.5 + dc) * TILE, (p.row + 0.4 + dr) * TILE, 'env', env(name)).setOrigin(0.5).setScale(sc).setDepth(-2.7)
    }
    for (let i = 0; i < 3; i++) {
      const rip = scene.add
        .image((p.col + 0.5 + i) * TILE, (p.row + Math.min(2.6 + (i % 2), p.h - 0.5 - (i % 2) * 0.4)) * TILE, 'env', env('ripple_' + (i + 1)))
        .setOrigin(0.5)
        .setScale(0.25)
        .setDepth(-2.7)
        .setAlpha(0.2)
      scene.tweens.add({ targets: rip, alpha: 0.85, duration: 1400 + i * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    }
    const x0 = y.col * TILE
    const x1 = (y.col + y.w) * TILE
    for (const foot of [(y.row + 1) * TILE - 2, (y.row + y.h) * TILE - 2]) {
      for (let x = x0; x < x1 - 1; x += 84) {
        const w = Math.min(84, x1 - x)
        const f = scene.add.image(x, foot, 'fence_segment_3posts').setOrigin(0, 1).setScale(OBJ_SCALE).setDepth(foot)
        if (w < 84) f.setCrop(0, 0, w / OBJ_SCALE, 84)
      }
    }
    const vert = (x: number, r0: number, r1: number) => {
      if (r1 > r0) scene.add.image(x, r0 * TILE, 'fence_vertical').setOrigin(0.5, 0).setDisplaySize(12, (r1 - r0) * TILE).setDepth(-0.5)
    }
    vert(x1 - 8, y.row + 1, y.row + y.h - 1)
    vert(x0 + 8, y.row + 1, m.pondGate[0])
    vert(x0 + 8, m.pondGate[1] + 1, y.row + y.h - 1)
  }

  // Hàng rào chuồng (cạnh dưới chừa cổng).
  if (m.pen && m.penGate) {
    const p = m.pen
    const x0 = p.col * TILE
    const x1 = (p.col + p.w) * TILE
    const topFoot = (p.row + 1) * TILE - 2
    const botFoot = (p.row + p.h) * TILE - 2
    const run = (xa: number, xb: number, foot: number) => {
      for (let x = xa; x < xb - 1; x += 84) {
        const w = Math.min(84, xb - x)
        const f = scene.add.image(x, foot, 'fence_segment_3posts').setOrigin(0, 1).setScale(OBJ_SCALE).setDepth(foot)
        if (w < 84) f.setCrop(0, 0, w / OBJ_SCALE, 84)
      }
    }
    run(x0, x1, topFoot)
    run(x0, m.penGate[0] * TILE, botFoot)
    run((m.penGate[1] + 1) * TILE, x1, botFoot)
    for (const x of [x0 + 8, x1 - 8]) {
      scene.add.image(x, (p.row + 1) * TILE, 'fence_vertical').setOrigin(0.5, 0).setDisplaySize(12, (p.h - 2) * TILE).setDepth(-0.5)
    }
  }

  // Công trình nông trại.
  const bscale = { kitchen: 0.5, warehouse: 0.5 }
  for (const b of m.buildings) {
    const x = (b.col + b.w / 2) * TILE
    const fy = (b.row + b.h) * TILE
    obj(scene, b.id === 'kitchen' ? 'kitchen' : 'shed_tin', x, fy, bscale[b.id])
    const spot = buildingSpot(b)
    const arrow = scene.add.image((spot.col + 0.5) * TILE, (spot.row + 0.5) * TILE - 12, 'ui_arrow_down_yellow').setDisplaySize(28, 28).setDepth(spot.row * TILE + 40)
    scene.tweens.add({ targets: arrow, y: arrow.y - 5, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
  }

  // Vật thể khu chợ.
  for (const p of m.props) {
    const x = (p.col + p.w / 2) * TILE
    const fy = (p.row + p.h) * TILE
    obj(scene, p.sprite, x, fy, HUB_SCALE)
    if (p.action) {
      const spot = buildingSpot(p)
      const arrow = scene.add.image((spot.col + 0.5) * TILE, (spot.row + 0.5) * TILE - 12, 'ui_arrow_down_yellow').setDisplaySize(28, 28).setDepth(spot.row * TILE + 40)
      scene.tweens.add({ targets: arrow, y: arrow.y - 5, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    }
  }

  // Khu chợ: cổng FARM, cây hai bên.
  if (isHub) {
    obj(scene, 'gate_farm', 11.5 * TILE, 12 * TILE, HUB_SCALE)
    scene.add.text(11.5 * TILE - 2, 9.65 * TILE, 'FARM', { fontFamily: 'sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#fff3c4', stroke: '#5a2d0c', strokeThickness: 4 }).setOrigin(0.5).setDepth(12 * TILE + 1)
    obj(scene, 'tree_red', 0.6 * TILE, 12 * TILE, OBJ_SCALE)
    obj(scene, 'tree_orange', (m.cols - 0.6) * TILE, 12 * TILE, OBJ_SCALE)
    obj(scene, 'bush_round_green', 4.4 * TILE, 10.4 * TILE, 0.5, 0)
    obj(scene, 'bush_round_green', 15 * TILE, 10.4 * TILE, 0.5, 0)
    obj(scene, 'tree_yellow', 7.8 * TILE, 10 * TILE, OBJ_SCALE, 0)
    obj(scene, 'tree_orange', 17 * TILE, 10 * TILE, OBJ_SCALE, 0)
    obj(scene, 'tree_red', 26 * TILE, 10 * TILE, OBJ_SCALE, 0)
    obj(scene, 'haystack_small', 28.3 * TILE, 15.5 * TILE, 0.45, -1)
    obj(scene, 'daisy_cluster_medium', 2 * TILE, 15 * TILE, 0.5, -1)
    obj(scene, 'daisy_cluster_small', 20 * TILE, 15.6 * TILE, 0.5, -1)
  } else {
    // Cây lớn lá mùa thu trên dải cỏ sau; nhà đứng trước che gốc.
    const autumn = ['tree_orange', 'tree_red', 'tree_yellow']
    ;[2.5, 8.5, 17, 25.5, 33, 41.5, 48.5].forEach((c, i) => obj(scene, autumn[i % 3], c * TILE, footY - 4, OBJ_SCALE, footY - 20))
    obj(scene, 'haystack_large', 26 * TILE, 9 * TILE, 0.5) // đống rơm (ô 25-26, hàng 8)
    obj(scene, 'scarecrow', 34.5 * TILE, 9 * TILE, 0.5) // bù nhìn (ô 34, hàng 8)
    for (const [c, key] of [[10.5, 'bush_round_green'], [23.5, 'bush_tall_yellow'], [27.2, 'daisy_cluster_large'], [43.5, 'bush_round_green'], [45.6, 'daisy_cluster_medium']] as const) {
      obj(scene, key, c * TILE, footY, 0.4, footY - 25)
    }
  }

  // Biển "MUA" từng khu.
  for (const sg of m.signs) {
    const fy = (sg.row + 1) * TILE - 2
    obj(scene, 'sign_mua', (sg.col + 0.5) * TILE, fy + 14, 0.4, fy)
  }

  // Tường đá + hàng hoa dưới cùng, chừa lối ra; mũi tên vàng chỉ lối.
  if (m.wallRow !== undefined) {
    const wr = m.wallRow
    const gap = m.wallGap
    for (let c = 0; c < m.cols; c++) {
      if (gap && c >= gap[0] && c <= gap[1]) continue
      let name = hash(c, 5) % 2 ? 'wall_mid_a' : 'wall_mid_b'
      if (gap && c === gap[0] - 1) name = 'wall_end_right'
      if (gap && c === gap[1] + 1) name = 'wall_end_left'
      tile(scene, c, wr, name, wr * TILE)
      tile(scene, c, wr - 1, hash(c, 9) % 3 === 0 ? 'flower_strip_red' : 'flower_strip_mixed', wr * TILE + 1, 0, 14)
    }
    if (gap) {
      const ax = ((gap[0] + gap[1] + 1) / 2) * TILE
      const arrow = scene.add.image(ax, (wr - 0.2) * TILE, 'ui_arrow_down_yellow').setDisplaySize(40, 40).setDepth(wr * TILE + 2)
      scene.tweens.add({ targets: arrow, y: arrow.y + 8, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    }
  }

  // Lái buôn ở khu chợ: dáng đứng, có bảng tên.
  let npc: Phaser.GameObjects.Sprite | undefined
  if (m.npc) {
    const nFoot = (m.npc.row + 1) * TILE - 4
    npc = scene.add.sprite((m.npc.col + 0.5) * TILE, nFoot, 'npc_trader_1').setOrigin(0.5, 1).setScale(0.33).setDepth(nFoot)
    npc.anims.play('npc-trader')
    const plate = scene.add.image(npc.x, nFoot - npc.displayHeight - 4, 'ui_name_plate').setDisplaySize(76, 38).setDepth(9400)
    scene.add.text(plate.x, plate.y + 2, m.npc.name, { fontFamily: 'sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#5a2d0c' }).setOrigin(0.5).setDepth(9401)
  }
  return { mw, mh, npc }
}
