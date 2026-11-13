// Dữ liệu bản đồ theo tọa độ LƯỚI VUÔNG, đơn vị ô. Ô (c, r) phủ từ c đến c+1; tâm ô là (c+0.5, r+0.5).
// Không import gì để test Node đọc được. Phần hình nền/trang trí thuần túy nằm ở src/scenes/MapView.ts.

export const TILE = 32 // pixel trong game cho mỗi ô (bằng ô 32 px của bộ art môi trường)

export interface PlotDef {
  id: string // ID ổn định, dùng trong file lưu
  col: number
  row: number
  unlock?: Unlock // cấp mở rộng của một khu cần đạt thì ô đất mới dùng được
}

// Điều kiện mở khóa: khu `zone` đã mở rộng tới cấp `level` (thay cho việc hoàn thành đơn hàng).
export interface Unlock {
  zone: ZoneId
  level: number
}

export interface DoorDef {
  col: number // ô cửa: bước vào ô này sẽ chuyển bản đồ (ô phải đi được)
  row: number
  to: string // ID bản đồ đích
  spawn: { col: number; row: number } // vị trí chân ở bản đồ đích (không đặt trên ô cửa của đích)
}

// Chỗ ở của một con vật nuôi (mỗi chỗ chứa tối đa một con): trong chuồng (heo, bò) hoặc thả rông ngoài bãi cỏ (gà, vịt).
export interface AnimalSlotDef {
  id: string // ID ổn định, dùng trong file lưu: pen_k (trong chuồng), free_k (thả rông) hoặc fish_r_c (hồ cá)
  col: number
  row: number
  free?: boolean // chỗ thả rông
  pond?: boolean // chỗ trong hồ cá (cá)
}

// Nơi rải/đổ thức ăn cho cả nhóm vật nuôi cùng nơi ở: máng (chuồng), bãi cỏ (thả rông), mặt nước (hồ). Hình chữ nhật theo ô.
export interface FeederDef {
  home: 'pen' | 'free' | 'pond'
  col: number
  row: number
  w: number
  h: number
}

// Ổ trứng của gà/vịt: gà vịt tự đẻ vào đây; lấy hết trứng của loài đó bằng một lần bấm E. `item` là ID sản phẩm.
export interface NestDef {
  item: 'egg' | 'duck_egg'
  col: number
  row: number
}

// Công trình tương tác bằng cách đứng ở ô ngay dưới chính giữa rồi nhấn E (không vào bên trong).
export interface BuildingDef {
  id: 'kitchen' | 'warehouse'
  col: number // góc trên-trái của khối công trình
  row: number
  w: number
  h: number
}

// Vật thể ở khu chợ: chặn đường; một số tương tác được (đứng ở ô ngay dưới chính giữa, nhấn E).
export interface PropDef {
  id: string
  sprite: string // khóa ảnh
  col: number
  row: number
  w: number
  h: number
  action?: 'shop' | 'quests'
  label?: string
}

// Ô để đứng tương tác với công trình/vật thể: ngay dưới chính giữa.
export const buildingSpot = (b: { col: number; row: number; w: number; h: number }): { col: number; row: number } => ({
  col: b.col + Math.floor(b.w / 2),
  row: b.row + b.h,
})

// ---------- Các khu của nông trại ----------
// Mỗi khu có biển "MUA" riêng. Bản đồ nông trại có kích thước CỐ ĐỊNH (như ảnh tham khảo); mở rộng một khu làm xuất hiện
// thêm chỗ nuôi trong chuồng, thêm ô đất ở các lô cỏ còn trống, thêm hàng ô nước trong hồ, thêm mẻ nấu, thêm sức chứa.
export type ZoneId = 'pen' | 'field' | 'pond' | 'kitchen' | 'warehouse'
export const ZONE_IDS: ZoneId[] = ['pen', 'kitchen', 'warehouse', 'field', 'pond']
export interface ZoneDef {
  name: string
  effect: string // hiệu ứng của mỗi cấp (hiện trên gợi ý ở biển MUA)
  baseCols: number // số "dãy" ở cấp 0: chuồng = cột chỗ nuôi (2 chỗ/cột), ruộng = số ô đất, hồ = hàng ô nước (3 ô/hàng)
  perLevel: number // mỗi cấp thêm bao nhiêu dãy (0 với nhà bếp, nhà kho)
  costs: number[] // giá từng cấp; độ dài = số cấp tối đa
}
export const ZONES: Record<ZoneId, ZoneDef> = {
  pen: { name: 'khu chăn nuôi', effect: '+4 chỗ chuồng (heo, bò), +3 chỗ thả rông (gà, vịt)', baseCols: 2, perLevel: 2, costs: [300, 700, 1200] },
  // Mỗi cấp = 1 ô đất mới (63 cấp: 4 lô x 18 ô - 9 ô có sẵn); giá tăng dần theo ô.
  field: { name: 'khu trồng trọt', effect: '+1 ô đất', baseCols: 9, perLevel: 1, costs: Array.from({ length: 63 }, (_, k) => 40 + 10 * k) },
  pond: { name: 'hồ cá', effect: 'hồ rộng thêm (nuôi được nhiều cá hơn)', baseCols: 2, perLevel: 1, costs: [300, 700] },
  kitchen: { name: 'nhà bếp', effect: '+1 mẻ nấu cùng lúc', baseCols: 0, perLevel: 0, costs: [350, 900] },
  warehouse: { name: 'nhà kho', effect: '+100 sức chứa', baseCols: 0, perLevel: 0, costs: [250, 600, 1200] },
}
export type ZoneLevels = Record<ZoneId, number>
export const unlockMet = (zones: ZoneLevels, u?: Unlock): boolean => !u || (zones[u.zone] ?? 0) >= u.level
export const unlockText = (u: Unlock): string => `mở rộng ${ZONES[u.zone].name} lên cấp ${u.level}`
export const NO_ZONE_LEVELS: ZoneLevels = { pen: 0, kitchen: 0, warehouse: 0, field: 0, pond: 0 }
const levelOf = (z: ZoneId, levels: ZoneLevels) => Math.max(0, Math.min(levels[z] ?? 0, ZONES[z].costs.length))
export const zoneCols = (z: ZoneId, level: number): number => ZONES[z].baseCols + ZONES[z].perLevel * Math.max(0, Math.min(level, ZONES[z].costs.length))

// Biển "MUA" mở rộng một khu: đứng ở ô ngay bên phải biển để mua.
export interface SignDef {
  zone: ZoneId
  col: number
  row: number
}

export interface Rect {
  col: number
  row: number
  w: number
  h: number
}

export interface MapDef {
  id: string
  name: string
  cols: number
  rows: number
  bg: string
  skyRows: number // số hàng trên cùng là phông nền (trời, cây xa, dải cỏ sau): không đi vào được
  start: { col: number; row: number } // vị trí chân khi vào lần đầu / khi dữ liệu lưu không hợp lệ
  plots: PlotDef[]
  npc?: { id: string; name: string; col: number; row: number }
  blocked: Array<[number, number]> // mọi ô chặn đường (phông nền, hàng rào, tường, biển, vật trang trí lớn)
  doors: DoorDef[]
  animalSlots: AnimalSlotDef[]
  buildings: BuildingDef[]
  props: PropDef[]
  signs: SignDef[]
  lots: Rect[] // các lô cỏ viền bo (nền chung là đất)
  pen?: Rect // khung chuồng (hàng rào bao quanh, cửa ở cạnh dưới)
  penGate?: [number, number] // cột đầu và cột cuối của cửa chuồng ở cạnh dưới
  pond?: Rect // mặt nước của hồ cá (không đi vào được); cá bơi trong đó
  feeders?: FeederDef[]
  nests?: NestDef[]
  pondYard?: Rect // sân hồ: hàng rào bao quanh (các ô biên), bờ đi lại ở trong
  pondGate?: [number, number] // hàng đầu và hàng cuối của cổng ở cạnh trái sân hồ
  wallRow?: number // hàng tường đá + hoa dưới cùng
  wallGap?: [number, number] // cột đầu và cột cuối của lối ra trên tường
}

const rect = (c0: number, r0: number, w: number, h: number, except: Array<[number, number]> = []) => {
  const out: Array<[number, number]> = []
  for (let r = r0; r < r0 + h; r++)
    for (let c = c0; c < c0 + w; c++) if (!except.some(([ec, er]) => ec === c && er === r)) out.push([c, r])
  return out
}

// ---------- Nông trại (theo ảnh ghép toàn cảnh của chủ dự án) ----------
// 54 x 17 ô (1728 x 544 px): cao đúng một màn hình, cuộn ngang. Từ trái sang phải: chuồng, nhà bếp + nhà kho + đống rơm,
// khoảng đất giữa (lối ra chợ ở tường dưới), bốn lô ruộng (2 x 2), hồ cá.
//   hàng 0-7: phông nền (trời, cây xa, cây lớn, dải cỏ sau); hàng 7-8: chân nhà bếp/nhà kho; hàng 8-10 và 12-14: lô ruộng;
//   hàng 9-12: trong chuồng; hàng 9-14: hồ cá; hàng 15: đường dưới; hàng 16: hoa + tường đá.
const FARM_COLS = 54
const FARM_ROWS = 17
const FARM_SKY = 8
const PEN: Rect = { col: 1, row: 8, w: 10, h: 6 } // cỡ tối đa (cấp 3); w thu nhỏ theo cấp trong farmLayout. Trong: hàng 9-12
// Chỗ thả rông của gà, vịt: các bãi cỏ cạnh nhà bếp và nhà kho; mỗi cấp khu chăn nuôi mở thêm 3 chỗ theo thứ tự này.
const FREE_SPOTS: Array<[number, number]> = [[13, 12], [18, 12], [21, 12], [15, 11], [19, 13], [22, 11], [12, 13], [20, 11], [17, 13], [14, 13], [22, 13], [16, 12]]
export const FREE_BASE = 3
export const FREE_PER_LEVEL = 3
export const freeCols = (level: number): number => FREE_BASE + FREE_PER_LEVEL * Math.max(0, Math.min(level, ZONES.pen.costs.length))
const FIELD_LOTS: Rect[] = [
  { col: 27, row: 8, w: 8, h: 3 },
  { col: 37, row: 8, w: 8, h: 3 },
  { col: 27, row: 12, w: 8, h: 3 },
  { col: 37, row: 12, w: 8, h: 3 },
]
const LAWNS: Rect[] = [
  { col: 12, row: 11, w: 4, h: 3 },
  { col: 17, row: 11, w: 6, h: 3 },
]
// Ổ trứng đặt ở mép trên hai bãi cỏ cạnh nhà bếp/nhà kho: gà ở bãi trái, vịt ở bãi phải (chỉ để chỗ lấy trứng, không chặn đường).
const NEST_SPOTS: NestDef[] = [
  { item: 'egg', col: 13, row: 11 },
  { item: 'duck_egg', col: 19, row: 11 },
]
const POND_YARD: Rect = { col: 45, row: 8, w: 8, h: 8 } // cỡ tối đa; h thu nhỏ theo cấp. Hàng rào ở các ô biên, bờ ở hàng 9 và hàng dưới nước
const POND: Rect = { col: 47, row: 10, w: 4, h: 4 } // mặt nước cỡ tối đa: cột 47-50, hàng 10-13 (thu nhỏ theo cấp trong farmLayout)
// Cỡ hồ theo cấp: cấp 0 rộng 3 x cao 3; cấp 1 rộng 4 x cao 3; cấp 2 rộng 4 x cao 4 (kích thước tối đa mà sân hồ chứa được). Mỗi ô nước chứa 1 con cá.
export const pondDims = (level: number): { cols: number; rows: number } => {
  const lv = Math.max(0, Math.min(level, ZONES.pond.costs.length))
  return { cols: 3 + Math.min(lv, 1), rows: 3 + Math.max(lv - 1, 0) }
}
export const pondCapacity = (level: number): number => pondDims(level).cols * pondDims(level).rows
const fishId = (r: number, c: number) => `fish_${r}_${c}`
// ID chỗ cá của một cấp hồ, theo hàng rồi cột.
export const pondSlotIds = (level: number): string[] => {
  const { cols, rows } = pondDims(level)
  const out: string[] = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push(fishId(r, c))
  return out
}
const POND_GATE: [number, number] = [11, 12] // cổng bên trái sân hồ
const EXIT: [number, number] = [24, 26]

// ID ô ruộng: lô đầu plot_{i}_{j}; lô thứ k (cấp mở rộng k) plot_e{k}_{i}_{j}. i = cột 0-2, j = hàng 0-2.
const FIELD_LOT_PLOTS = 18 // 6 cột x 3 hàng mỗi lô
const FIELD_BASE_PLOTS = 9
const fieldPlotId = (k: number, i: number, j: number) => (k === 0 ? `plot_${i}_${j}` : `plot_e${k}_${i}_${j}`)

export function farmLayout(levels: ZoneLevels = NO_ZONE_LEVELS): MapDef {
  const blocked: Array<[number, number]> = []
  const plots: PlotDef[] = []
  const animalSlots: AnimalSlotDef[] = []
  const signs: SignDef[] = []
  const addSign = (zone: ZoneId, col: number, row: number) => {
    if (levelOf(zone, levels) >= ZONES[zone].costs.length) return // đã mở hết: không còn biển
    signs.push({ zone, col, row })
    blocked.push([col, row])
  }

  // Phông nền và hai dải lúa hai bên.
  blocked.push(...rect(0, 0, FARM_COLS, FARM_SKY))
  blocked.push(...rect(0, FARM_SKY, 1, FARM_ROWS - FARM_SKY - 1))
  blocked.push(...rect(FARM_COLS - 1, FARM_SKY, 1, FARM_ROWS - FARM_SKY - 1))
  // Tường đá dưới cùng, chừa lối ra chợ.
  for (let c = 0; c < FARM_COLS; c++) if (c < EXIT[0] || c > EXIT[1]) blocked.push([c, FARM_ROWS - 1])

  // Chuồng: hàng rào bốn phía, cửa ở cạnh dưới. Chỗ nuôi theo cột (2 chỗ mỗi cột: hàng 9 và 11), hàng 10 và 12 là lối đi.
  // Khung chuồng lớn dần theo cấp: mỗi cột chỗ nuôi thêm một ô chiều rộng; cửa nằm giữa cạnh dưới.
  const penCols = zoneCols('pen', levelOf('pen', levels))
  const pen: Rect = { ...PEN, w: penCols + 2 }
  const penRight = pen.col + pen.w - 1
  const penBottom = pen.row + pen.h - 1
  const penGate: [number, number] = [pen.col + 1, pen.col + 1] // cổng 1 ô ở góc trái cạnh dưới; máng nằm ngay bên phải cổng
  for (let c = pen.col; c <= penRight; c++) {
    blocked.push([c, pen.row])
    if (c < penGate[0] || c > penGate[1]) blocked.push([c, penBottom])
  }
  for (let r = pen.row + 1; r < penBottom; r++) blocked.push([pen.col, r], [penRight, r])
  for (let k = 0; k < penCols * 2; k++) animalSlots.push({ id: `pen_${k}`, col: PEN.col + 1 + Math.floor(k / 2), row: PEN.row + 1 + 2 * (k % 2) })
  for (let k = 0; k < freeCols(levelOf('pen', levels)); k++) animalSlots.push({ id: `free_${k}`, col: FREE_SPOTS[k][0], row: FREE_SPOTS[k][1], free: true })
  addSign('pen', penRight + 1, penBottom - 1) // biển ngay ngoài hàng rào phải, dời theo khung

  // Nhà bếp và nhà kho trên dải cỏ sau; biển MUA bên phải mỗi nhà; đống rơm bên phải nhà kho.
  const buildings: BuildingDef[] = [
    { id: 'kitchen', col: 12, row: 7, w: 4, h: 2 },
    { id: 'warehouse', col: 18, row: 7, w: 4, h: 2 },
  ]
  addSign('kitchen', 16, 8)
  addSign('warehouse', 22, 8)
  blocked.push([25, 8], [26, 8]) // đống rơm

  // Ruộng: mỗi lô chứa 6 cột x 3 hàng = 18 ô; mở lần lượt từng ô (theo cột, hết lô này sang lô sau). Có sẵn 9 ô, mỗi cấp mở thêm 1 ô.
  const fieldLevel = levelOf('field', levels)
  const slotAt = (n: number) => {
    const lot = FIELD_LOTS[Math.floor(n / FIELD_LOT_PLOTS)]
    const r = n % FIELD_LOT_PLOTS
    const i = Math.floor(r / 3)
    const j = r % 3
    return { id: fieldPlotId(Math.floor(n / FIELD_LOT_PLOTS), i, j), col: lot.col + 1 + i, row: lot.row + j }
  }
  for (let n = 0; n < FIELD_BASE_PLOTS + fieldLevel; n++) plots.push(slotAt(n))
  blocked.push([FIELD_LOTS[0].col + 7, FIELD_LOTS[0].row]) // bù nhìn ở lô đầu (cột cuối của lô, ngoài các ô đất)
  if (fieldLevel < ZONES.field.costs.length) {
    const next = slotAt(FIELD_BASE_PLOTS + fieldLevel)
    addSign('field', next.col, next.row) // biển cắm ngay tại ô đất sẽ mở tiếp theo
  }

  // Hồ cá: có sẵn, rộng ra theo cấp (xem pondDims). Mặt nước không đi vào được; cá bơi trong đó, rải thức ăn từ bờ.
  const dims = pondDims(levelOf('pond', levels))
  const pond: Rect = { col: POND.col, row: POND.row, w: dims.cols, h: dims.rows }
  for (let r = 0; r < dims.rows; r++) for (let c = 0; c < dims.cols; c++) animalSlots.push({ id: fishId(r, c), col: pond.col + c, row: pond.row + r, pond: true })
  // Sân hồ ôm sát mặt nước: bờ rộng 1 ô mỗi phía rồi tới hàng rào.
  const yd: Rect = { col: POND_YARD.col, row: POND_YARD.row, w: dims.cols + 4, h: dims.rows + 4 }
  for (let c = yd.col; c < yd.col + yd.w; c++) blocked.push([c, yd.row], [c, yd.row + yd.h - 1])
  for (let r = yd.row + 1; r < yd.row + yd.h - 1; r++) {
    blocked.push([yd.col + yd.w - 1, r])
    if (r < POND_GATE[0] || r > POND_GATE[1]) blocked.push([yd.col, r])
  }
  blocked.push(...rect(pond.col, pond.row, pond.w, pond.h))
  addSign('pond', yd.col - 1, POND_GATE[1])

  return {
    id: 'farm',
    name: 'Nông trại',
    cols: FARM_COLS,
    rows: FARM_ROWS,
    bg: '#b99a66',
    skyRows: FARM_SKY,
    start: { col: 25.5, row: 13.5 },
    plots,
    blocked,
    doors: [EXIT[0], EXIT[0] + 1, EXIT[1]].map((col) => ({ col, row: FARM_ROWS - 1, to: 'hub', spawn: { col: 11.5, row: 12.6 } })),
    animalSlots,
    buildings,
    props: [],
    signs,
    lots: [...LAWNS, ...FIELD_LOTS],
    pen,
    penGate,
    pond,
    pondYard: yd,
    nests: NEST_SPOTS,
    feeders: [
      { home: 'pen', col: pen.col + 2, row: pen.row + pen.h - 2, w: Math.min(2, penCols - 1), h: 1 }, // một máng duy nhất, hàng trong cùng sát cổng
      ...LAWNS.map((l): FeederDef => ({ home: 'free', ...l })),
      { home: 'pond', ...pond },
    ],
    pondGate: POND_GATE,
    wallRow: FARM_ROWS - 1,
    wallGap: EXIT,
  }
}

// ---------- Khu chợ (theo ảnh tham khảo thứ nhất) ----------
// 30 x 17 ô (vừa một màn hình): lái buôn, rương, cổng FARM (đi qua để vào nông trại), bảng tin (đơn hàng), cửa hàng, quầy trái cây.
const HUB_SKY = 10
const hub: MapDef = (() => {
  const props: PropDef[] = [
    { id: 'chest', sprite: 'chest', col: 6, row: 11, w: 2, h: 1 },
    { id: 'board', sprite: 'notice_board', col: 16, row: 11, w: 2, h: 1, action: 'quests', label: 'Bảng tin' },
    { id: 'shop', sprite: 'farm_shop', col: 19, row: 10, w: 5, h: 2, action: 'shop', label: 'Cửa hàng' },
    { id: 'stall', sprite: 'stall_fruit', col: 25, row: 11, w: 3, h: 1 },
  ]
  const blocked: Array<[number, number]> = [...rect(0, 0, 30, HUB_SKY)]
  for (const p of props) blocked.push(...rect(p.col, p.row, p.w, p.h))
  blocked.push([9, 10], [9, 11], [13, 10], [13, 11]) // hai trụ cổng
  blocked.push([0, 10], [0, 11], [29, 10], [29, 11]) // gốc cây hai bên
  return {
    id: 'hub',
    name: 'Khu chợ',
    cols: 30,
    rows: 17,
    bg: '#b99a66',
    skyRows: HUB_SKY,
    start: { col: 5.5, row: 13.5 },
    plots: [],
    npc: { id: 'shopkeeper', name: 'Lái buôn', col: 3, row: 11 },
    blocked,
    // Bước qua cổng FARM (ba ô giữa hai trụ, hàng 10) là vào nông trại, xuất hiện ngay trên lối ra ở tường dưới.
    doors: [10, 11, 12].map((col) => ({ col, row: 10, to: 'farm', spawn: { col: 25.5, row: 14.6 } })),
    animalSlots: [],
    buildings: [],
    props,
    signs: [],
    lots: [],
  }
})()

// Các ô đất bị tưới khi tưới ô `centerId` bằng bình tưới cấp `level`:
//  0: chỉ ô đó. 1: ô đó và ô kề trái/phải cùng hàng. 2: khối 3x3 quanh ô đó.
// Chỉ tính các ô đang mở (isUnlocked). Ô trung tâm luôn đứng đầu danh sách.
export function plotsInArea(
  plots: PlotDef[],
  centerId: string,
  level: number,
  isUnlocked: (p: PlotDef) => boolean = () => true,
): string[] {
  const c = plots.find((p) => p.id === centerId)
  if (!c) return []
  const out = [c.id]
  if (level <= 0) return out
  for (const p of plots) {
    if (p.id === c.id || !isUnlocked(p)) continue
    const dc = Math.abs(p.col - c.col)
    const dr = Math.abs(p.row - c.row)
    if (level === 1 ? dr === 0 && dc === 1 : dc <= 1 && dr <= 1) out.push(p.id)
  }
  return out
}

const farm0 = farmLayout(NO_ZONE_LEVELS)
const farmMax = farmLayout(Object.fromEntries(ZONE_IDS.map((z) => [z, ZONES[z].costs.length])) as ZoneLevels)

// Bản đồ tĩnh (nông trại ở cấp mở rộng 0). Dùng getMap để lấy nông trại theo cấp mở rộng thật của người chơi.
export const MAPS: Record<string, MapDef> = { farm: farm0, hub }
export const MAP_IDS = Object.keys(MAPS)
export const START_MAP = 'hub' // người chơi mới bắt đầu ở khu chợ, cạnh lái buôn
export function getMap(id: string, levels: ZoneLevels = NO_ZONE_LEVELS): MapDef {
  return id === 'farm' ? farmLayout(levels) : MAPS[id]
}
// Danh sách ID: lấy từ nông trại mở rộng tối đa để mọi ô đất / chỗ vật nuôi có thể xuất hiện đều có trạng thái trong save.
export const ALL_PLOTS: PlotDef[] = [...farmMax.plots]
export const ALL_PLOT_IDS = ALL_PLOTS.map((p) => p.id)
export const ALL_ANIMAL_SLOTS: AnimalSlotDef[] = [...farmMax.animalSlots]
export const ALL_ANIMAL_SLOT_IDS = ALL_ANIMAL_SLOTS.map((s) => s.id)
export const ALL_PEN_SLOT_IDS = ALL_ANIMAL_SLOTS.filter((s) => !s.free && !s.pond).map((s) => s.id)
export const ALL_FREE_SLOT_IDS = ALL_ANIMAL_SLOTS.filter((s) => s.free).map((s) => s.id)
export const ALL_POND_SLOT_IDS = ALL_ANIMAL_SLOTS.filter((s) => s.pond).map((s) => s.id)
export const isFreeSlot = (id: string): boolean => id.startsWith('free_')
export const isPondSlot = (id: string): boolean => id.startsWith('fish_')
export type Home = 'free' | 'pen' | 'pond'
export const slotHome = (id: string): Home => (isFreeSlot(id) ? 'free' : isPondSlot(id) ? 'pond' : 'pen')
export const MAX_FARM = farmMax
