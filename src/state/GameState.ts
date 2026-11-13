// Logic game thuần (không phụ thuộc Phaser) để kiểm thử riêng: tiền, túi đồ, ô đất, lưu.
import { CROPS, ITEMS, START_MONEY, STARTER_SEEDS } from '../data/items.ts'
import { ALL_ANIMAL_SLOT_IDS, ALL_FREE_SLOT_IDS, ALL_PEN_SLOT_IDS, MAPS, MAP_IDS, NO_ZONE_LEVELS, START_MAP, ZONES, ZONE_IDS, freeCols, isFreeSlot, pondCapacity, pondSlotIds, slotHome, unlockMet, zoneCols, type Home, type ZoneId, type ZoneLevels } from '../data/world.ts'
import { KITCHEN_MAX_SLOTS, RECIPES } from '../data/recipes.ts'
import { QUESTS, QUEST_IDS, type QuestDef } from '../data/quests.ts'
import { ANIMALS, NEST_CAP } from '../data/animals.ts'
import { BASE_CAPACITY, CAPACITY_PER_LEVEL, GROWTH_BONUS_PER_LEVEL, UPGRADES, UPGRADE_IDS } from '../data/upgrades.ts'
import { DAY_MS, SLEEP_HOUR, hourOf } from './clock.ts'

// Lịch sử phiên bản lưu:
//  1: bản đầu. 2: thêm `map`. 3: mỗi ô đất ghi loại cây `crop`. 4: thêm `flags.done` (đơn hàng đã xong).
//  5: thêm `day`, `time`, `energy`, `upgrades`. 6: thêm `animals` (vật nuôi theo chỗ trong chuồng).
//  7: thêm `expansion` (cấp mở rộng nông trại; thiếu -> 0).
//  8: thêm `kitchen` (mẻ đang nấu; thiếu -> không có).
// 10: thêm khu 'kitchen' và 'warehouse' vào `zones`; `kitchen` thành mảng các mẻ (nấu nhiều mẻ cùng lúc); nâng cấp 'warehouse'
//     chuyển thành zones.warehouse.
//  9: `expansion` (cấp mở rộng ruộng) đổi thành `zones` {pen, field, pond}: cấp mở rộng của từng khu. Bản đồ nông trại
//     được bố trí lại thành dải ngang theo khu, nên vị trí người chơi ở nông trại trong save bản 1-8 được đặt về điểm xuất phát.
// 11: bản đồ làm lại theo ảnh tham khảo (ô 32 px, nông trại cố định 54x17, thêm khu chợ 'hub', bỏ bản đồ 'house'): save cũ đang ở
//     'house' chuyển sang 'hub'; vị trí người chơi trong save bản 1-10 về điểm xuất phát của bản đồ; hồ cá còn tối đa 2 cấp (cấp cũ lớn hơn bị hạ xuống).
// 12: bỏ điều kiện hoàn thành đơn hàng để mở khóa: hạt, thức ăn, vật nuôi, ô đất mở theo cấp mở rộng các khu; gà và vịt thả rông
//     (chỗ `free_k`) còn heo và bò ở trong chuồng (`pen_k`): gà, vịt trong chuồng của save cũ chuyển ra chỗ thả rông (hết chỗ thì hoàn tiền mua);
//     save cũ được tặng thêm tiền khởi đầu một lần.
// Hệ thống năng lượng đã bị bỏ: trường `energy` và nâng cấp `stamina` trong save cũ được bỏ qua.
// Bản cũ vẫn đọc được: thiếu map -> bản đồ đầu; thiếu crop -> cà rốt (loại duy nhất lúc đó); thiếu done -> chưa xong đơn nào;
// thiếu day/time/upgrades -> ngày 1, đầu ngày, chưa nâng cấp; thiếu animals -> chuồng trống.
// Ô đất và chỗ vật nuôi mới thêm sau này (không có trong file lưu) được tạo ở trạng thái trống, không làm hỏng save cũ.
export const SAVE_VERSION = 16

export interface PlotState {
  planted: boolean
  crop: string // ID hạt giống đang trồng (khóa trong CROPS); '' khi ô trống
  watered: boolean
  growMs: number
}

export interface AnimalState {
  kind: string // ID loài (khóa trong ANIMALS); '' khi chỗ trống
  fed: boolean // đã cho ăn (chỉ khi đã ăn mới ra sản phẩm)
  prodMs: number // thời gian đã tích lũy để ra sản phẩm
}

export interface KitchenJob {
  recipe: string // ID công thức (khóa trong RECIPES)
  ms: number // thời gian đã nấu, trong [0, cookMs]
}

export interface GameState {
  money: number
  inventory: Record<string, number>
  plots: Record<string, PlotState>
  flags: { gotStarter: boolean; done: string[] } // done: ID các đơn hàng đã hoàn thành
  map: string // ID bản đồ người chơi đang ở
  player: { col: number; row: number } // vị trí chân trong bản đồ hiện tại
  day: number // ngày thứ mấy (từ 1)
  time: number // mili giây đã trôi trong ngày hiện tại, trong [0, DAY_MS)
  upgrades: Record<string, number> // ID nâng cấp -> cấp hiện tại (chỉ ghi nâng cấp đã mua)
  animals: Record<string, AnimalState> // ID chỗ trong chuồng -> vật nuôi
  zones: ZoneLevels // cấp mở rộng đã mua của từng khu (0 = chưa mua)
  nests: Record<string, number> // ổ trứng gà/vịt: ID sản phẩm (egg, duck_egg) -> số trứng đang nằm trong ổ
  kitchen: Array<KitchenJob | null> // các mẻ đang nấu ở nhà bếp (độ dài KITCHEN_MAX_SLOTS; chỉ 1 + zones.kitchen mẻ đầu dùng được); null khi rảnh
}

const emptyAnimal = (): AnimalState => ({ kind: '', fed: false, prodMs: 0 })

// ---------- Nâng cấp ----------
export const upgradeLevel = (s: GameState, id: string): number => s.upgrades[id] ?? 0
// Nhà kho: tổng số vật phẩm trong túi không vượt sức chứa (nhận thêm vật phẩm bị từ chối khi đầy).
export const capacity = (s: GameState): number => BASE_CAPACITY + CAPACITY_PER_LEVEL * s.zones.warehouse
export const totalItems = (s: GameState): number => Object.values(s.inventory).reduce((a, b) => a + b, 0)
export const hasRoom = (s: GameState, qty: number): boolean => totalItems(s) + qty <= capacity(s)
export const growthMultiplier = (s: GameState): number => 1 + GROWTH_BONUS_PER_LEVEL * upgradeLevel(s, 'fertilizer')
export const waterLevel = (s: GameState): number => upgradeLevel(s, 'can')

export function newGame(
  plotIds: string[],
  start: { col: number; row: number },
  map = START_MAP,
  slotIds: string[] = ALL_ANIMAL_SLOT_IDS,
): GameState {
  const plots: Record<string, PlotState> = {}
  for (const id of plotIds) plots[id] = { planted: false, crop: '', watered: false, growMs: 0 }
  const animals: Record<string, AnimalState> = {}
  for (const id of slotIds) animals[id] = emptyAnimal()
  return {
    money: START_MONEY,
    inventory: {},
    plots,
    flags: { gotStarter: false, done: [] },
    map,
    player: { col: start.col, row: start.row },
    day: 1,
    time: 0,
    upgrades: {},
    animals,
    zones: { ...NO_ZONE_LEVELS },
    nests: {},
    kitchen: Array.from({ length: KITCHEN_MAX_SLOTS }, () => null),
  }
}

// ---------- Mở rộng các khu ----------
export type ExpandResult = 'ok' | 'no-money' | 'max-level' | 'unknown'

// Giá cấp mở rộng tiếp theo của một khu; null khi đã mở hết (hoặc khu lạ).
export const zoneCost = (s: GameState, zone: ZoneId): number | null => ZONES[zone]?.costs[s.zones[zone]] ?? null

// Kiểm tra đủ điều kiện TRƯỚC khi trừ tiền.
export function buyZone(s: GameState, zone: ZoneId): ExpandResult {
  if (!ZONES[zone]) return 'unknown'
  const cost = zoneCost(s, zone)
  if (cost === null) return 'max-level'
  if (s.money < cost) return 'no-money'
  s.money -= cost
  s.zones[zone] += 1
  return 'ok'
}

// Số chỗ trong chuồng ở cấp mở rộng hiện tại (hai hàng chỗ ở).
export const penCapacity = (s: GameState): number => zoneCols('pen', s.zones.pen) * 2
// Số chỗ thả rông (gà, vịt) ở cấp mở rộng hiện tại.
export const freeCapacity = (s: GameState): number => freeCols(s.zones.pen)
// Số chỗ và số con của nơi ở: 'free' (thả rông), 'pen' (chuồng) hoặc 'pond' (hồ cá).
export const homeCapacity = (s: GameState, home: Home): number => (home === 'free' ? freeCapacity(s) : home === 'pond' ? pondCapacity(s.zones.pond) : penCapacity(s))
export const homeCount = (s: GameState, home: Home): number =>
  Object.entries(s.animals).filter(([id, a]) => a.kind !== '' && slotHome(id) === home).length

export type UpgradeResult = 'ok' | 'no-money' | 'max-level' | 'unknown'

// Mua cấp tiếp theo của một nâng cấp: kiểm tra đủ tiền TRƯỚC khi trừ.
export function buyUpgrade(s: GameState, id: string): UpgradeResult {
  const def = UPGRADES.find((u) => u.id === id)
  if (!def) return 'unknown'
  const level = upgradeLevel(s, id)
  if (level >= def.costs.length) return 'max-level'
  const cost = def.costs[level]
  if (s.money < cost) return 'no-money'
  s.money -= cost
  s.upgrades[id] = level + 1
  return 'ok'
}

// ---------- Thời gian trong ngày ----------
// Cho thời gian trôi dtMs. Hết ngày (24:00) tự sang ngày mới. Trả về true nếu vừa sang ngày mới.
export function tickTime(s: GameState, dtMs: number): boolean {
  if (!(dtMs > 0)) return false
  s.time += dtMs
  if (s.time < DAY_MS) return false
  s.time = 0
  s.day += 1
  return true
}

export type SleepResult = 'ok' | 'too-early'

// Ngủ ở giường: chỉ từ SLEEP_HOUR trở đi. Sang ngày mới, đầu ngày.
export function sleep(s: GameState): SleepResult {
  if (hourOf(s.time) < SLEEP_HOUR) return 'too-early'
  s.day += 1
  s.time = 0
  return 'ok'
}

// ---------- Túi đồ ----------
export function count(s: GameState, itemId: string): number {
  return s.inventory[itemId] ?? 0
}

export function addItem(s: GameState, itemId: string, qty: number): boolean {
  if (!(itemId in ITEMS) || !Number.isInteger(qty) || qty <= 0) return false
  s.inventory[itemId] = count(s, itemId) + qty
  return true
}

export function removeItem(s: GameState, itemId: string, qty: number): boolean {
  if (!Number.isInteger(qty) || qty <= 0 || count(s, itemId) < qty) return false
  const left = count(s, itemId) - qty
  if (left === 0) delete s.inventory[itemId]
  else s.inventory[itemId] = left
  return true
}

// ---------- Cửa hàng ----------
export type TradeResult = 'ok' | 'no-money' | 'not-for-sale' | 'locked' | 'nothing-to-sell' | 'full'

// Vật phẩm có thể mua ở cửa hàng không: có giá mua và đã mở khóa (nếu cần hoàn thành đơn hàng).
export function isBuyable(s: GameState, itemId: string): boolean {
  const item = ITEMS[itemId]
  if (!item || item.buyPrice === undefined) return false
  return unlockMet(s.zones, item.unlock)
}

export function buy(s: GameState, itemId: string, qty = 1): TradeResult {
  const price = ITEMS[itemId]?.buyPrice
  if (price === undefined) return 'not-for-sale'
  if (!isBuyable(s, itemId)) return 'locked'
  const cost = price * qty
  if (s.money < cost) return 'no-money'
  if (!hasRoom(s, qty)) return 'full'
  if (!addItem(s, itemId, qty)) return 'not-for-sale'
  s.money -= cost
  return 'ok'
}

// Bán toàn bộ nông sản (mọi vật phẩm có giá bán); trả về tổng tiền nhận được.
export function sellAllProduce(s: GameState): number {
  let total = 0
  for (const id of Object.keys(ITEMS)) total += sellAll(s, id)
  return total
}

// Bán toàn bộ một loại; trả về số tiền nhận được (0 nếu không bán được).
export function sellAll(s: GameState, itemId: string): number {
  const price = ITEMS[itemId]?.sellPrice
  const qty = count(s, itemId)
  if (price === undefined || qty === 0) return 0
  removeItem(s, itemId, qty)
  s.money += price * qty
  return price * qty
}

// ---------- Ô đất ----------
export type PlotAction =
  | 'ok'
  | 'unknown-plot'
  | 'unknown-seed'
  | 'occupied'
  | 'no-seed'
  | 'not-planted'
  | 'already-watered'
  | 'not-ready'
  | 'full' // kho đầy

export function isReady(p: PlotState): boolean {
  const crop = CROPS[p.crop]
  return p.planted && crop !== undefined && p.growMs >= crop.growMs
}

export function growProgress(p: PlotState): number {
  const crop = CROPS[p.crop]
  return p.planted && crop ? Math.min(1, p.growMs / crop.growMs) : 0
}

export function plant(s: GameState, plotId: string, seedId = 'seed_carrot'): PlotAction {
  const p = s.plots[plotId]
  if (!p) return 'unknown-plot'
  if (p.planted) return 'occupied'
  if (!(seedId in CROPS)) return 'unknown-seed'
  if (count(s, seedId) < 1) return 'no-seed'
  removeItem(s, seedId, 1)
  p.planted = true
  p.crop = seedId
  p.watered = false
  p.growMs = 0
  return 'ok'
}

// Tưới ô `plotId`; `extraIds` là các ô lân cận được tưới cùng (bình tưới lớn). Chỉ tưới khi ô chính tưới được. Ô phụ chỉ được tưới nếu hợp lệ (đang trồng, chưa tưới, chưa chín).
export function water(s: GameState, plotId: string, extraIds: string[] = []): PlotAction {
  const p = s.plots[plotId]
  if (!p) return 'unknown-plot'
  if (!p.planted) return 'not-planted'
  if (p.watered || isReady(p)) return 'already-watered'
  p.watered = true
  for (const id of extraIds) {
    const e = s.plots[id]
    if (e && id !== plotId && e.planted && !e.watered && !isReady(e)) e.watered = true
  }
  return 'ok'
}

export function harvest(s: GameState, plotId: string): PlotAction {
  const p = s.plots[plotId]
  if (!p) return 'unknown-plot'
  if (!isReady(p)) return 'not-ready'
  if (!hasRoom(s, CROPS[p.crop].yield)) return 'full' // kiểm tra TRƯỚC khi đổi trạng thái ô đất
  const crop = CROPS[p.crop]
  // Đổi trạng thái ô TRƯỚC khi thưởng để thao tác lặp lại không nhân đôi phần thưởng.
  p.planted = false
  p.crop = ''
  p.watered = false
  p.growMs = 0
  addItem(s, crop.harvestItem, crop.yield)
  return 'ok'
}

// Cây chỉ lớn khi đã tưới và game đang chạy (không lớn khi offline). Mỗi loại cây có thời gian lớn riêng.
// Phân bón làm cây lớn nhanh hơn (nhân với thời gian trôi).
export function tick(s: GameState, dtMs: number): void {
  if (!(dtMs > 0)) return
  const grown = dtMs * growthMultiplier(s)
  for (const p of Object.values(s.plots)) {
    const crop = CROPS[p.crop]
    if (p.planted && p.watered && crop && p.growMs < crop.growMs) p.growMs = Math.min(crop.growMs, p.growMs + grown)
  }
  for (const job of s.kitchen) {
    const recipe = job && RECIPES.find((x) => x.id === job.recipe)
    if (job && recipe && job.ms < recipe.cookMs) job.ms = Math.min(recipe.cookMs, job.ms + dtMs)
  }
  // Vật nuôi chỉ ra sản phẩm khi đã được cho ăn (phân bón không ảnh hưởng).
  for (const a of Object.values(s.animals)) {
    const def = ANIMALS[a.kind]
    if (def && a.fed && a.prodMs < def.produceMs) a.prodMs = Math.min(def.produceMs, a.prodMs + dtMs)
    // Gà, vịt tự đẻ vào ổ khi đủ thời gian rồi đứng chờ thức ăn lần sau; ổ đầy thì giữ trứng (nhặt tay như cũ).
    if (def && def.home === 'free' && animalReady(a) && (s.nests[def.product] ?? 0) + def.yield <= NEST_CAP) {
      s.nests[def.product] = (s.nests[def.product] ?? 0) + def.yield
      a.fed = false
      a.prodMs = 0
    }
  }
}

// Lấy HẾT trứng của một loài trong ổ về kho (lấy được bao nhiêu tùy chỗ trống; phần dư vẫn nằm trong ổ).
export function collectNest(s: GameState, product: string): { result: 'ok' | 'empty' | 'full'; taken: number } {
  const have = s.nests[product] ?? 0
  if (have <= 0) return { result: 'empty', taken: 0 }
  const taken = Math.min(have, capacity(s) - totalItems(s))
  if (taken <= 0) return { result: 'full', taken: 0 }
  s.nests[product] = have - taken
  addItem(s, product, taken)
  return { result: 'ok', taken }
}

// ---------- Vật nuôi ----------
export type AnimalAction =
  | 'ok'
  | 'unknown-slot'
  | 'unknown-kind'
  | 'locked' // chưa mở rộng đủ cấp để mở khóa
  | 'no-money'
  | 'full' // chuồng (hoặc bãi thả rông) hết chỗ
  | 'empty' // chỗ trống, không có vật nuôi
  | 'already-fed'
  | 'no-feed'
  | 'not-ready'
  | 'full'

export function animalReady(a: AnimalState): boolean {
  const def = ANIMALS[a.kind]
  return def !== undefined && a.fed && a.prodMs >= def.produceMs
}

export function animalProgress(a: AnimalState): number {
  const def = ANIMALS[a.kind]
  return def && a.fed ? Math.min(1, a.prodMs / def.produceMs) : 0
}

export function animalCount(s: GameState): number {
  return Object.values(s.animals).filter((a) => a.kind !== '').length
}

export function isAnimalBuyable(s: GameState, kind: string): boolean {
  const def = ANIMALS[kind]
  return def !== undefined && unlockMet(s.zones, def.unlock)
}

// Mua một con và đặt vào chỗ trống đầu tiên trong chuồng. Kiểm tra mọi điều kiện TRƯỚC khi trừ tiền.
export function buyAnimal(s: GameState, kind: string): AnimalAction {
  const def = ANIMALS[kind]
  if (!def) return 'unknown-kind'
  if (!isAnimalBuyable(s, kind)) return 'locked'
  const ids = def.home === 'free' ? ALL_FREE_SLOT_IDS.slice(0, freeCapacity(s)) : def.home === 'pond' ? pondSlotIds(s.zones.pond) : ALL_PEN_SLOT_IDS.slice(0, penCapacity(s))
  const slotId = ids.find((id) => s.animals[id]?.kind === '')
  if (slotId === undefined) return 'full'
  if (s.money < def.price) return 'no-money'
  s.money -= def.price
  s.animals[slotId] = { kind, fed: false, prodMs: 0 }
  return 'ok'
}

// Rải/đổ thức ăn cho CẢ NHÓM vật nuôi cùng nơi ở (gà vịt ngoài bãi, heo bò ở máng, cá ở hồ): mỗi con đang đói dùng 1 phần
// thức ăn đúng loài; thiếu thức ăn loài nào thì các con loài đó vẫn đói. Con đã ăn rồi không bị trừ thêm.
export interface FeedResult {
  result: 'ok' | 'none-hungry' | 'no-feed'
  fed: number // số con vừa được ăn
  missing: string[] // ID các thức ăn đang thiếu (còn con đói mà hết)
}
export function feedHome(s: GameState, home: Home): FeedResult {
  const ids = Object.keys(s.animals).filter((id) => slotHome(id) === home && s.animals[id].kind !== '' && !s.animals[id].fed)
  if (ids.length === 0) return { result: 'none-hungry', fed: 0, missing: [] }
  let fed = 0
  const missing = new Set<string>()
  for (const id of ids) {
    const a = s.animals[id]
    const food = ANIMALS[a.kind].feed
    if (count(s, food) < 1) {
      missing.add(food)
      continue
    }
    removeItem(s, food, 1)
    a.fed = true
    a.prodMs = 0
    fed++
  }
  return { result: fed > 0 ? 'ok' : 'no-feed', fed, missing: [...missing] }
}
// Số con đang đói ở một nơi ở.
export const hungryCount = (s: GameState, home: Home): number =>
  Object.entries(s.animals).filter(([id, a]) => a.kind !== '' && !a.fed && slotHome(id) === home).length

// Nhặt sản phẩm khi đã chín. Đặt lại trạng thái TRƯỚC khi thưởng nên bấm lặp không nhân đôi phần thưởng.
export function collectProduct(s: GameState, slotId: string): AnimalAction {
  const a = s.animals[slotId]
  if (!a) return 'unknown-slot'
  if (a.kind === '') return 'empty'
  if (!animalReady(a)) return 'not-ready'
  if (!hasRoom(s, ANIMALS[a.kind].yield)) return 'full'
  const def = ANIMALS[a.kind]
  a.fed = false
  a.prodMs = 0
  addItem(s, def.product, def.yield)
  return 'ok'
}

// ---------- Nhà bếp ----------
export type KitchenAction = 'ok' | 'unknown-recipe' | 'busy' | 'no-ingredients' | 'not-ready' | 'idle' | 'full'

// Số mẻ nấu cùng lúc: 1 ở cấp 0, +1 mỗi cấp mở rộng nhà bếp.
export const kitchenSlots = (s: GameState): number => Math.min(KITCHEN_MAX_SLOTS, 1 + s.zones.kitchen)
const recipeOf = (job: KitchenJob | null) => (job ? RECIPES.find((x) => x.id === job.recipe) : undefined)

// Tiến độ 0..1 của một mẻ (0 nếu ô trống).
export function jobProgress(job: KitchenJob | null): number {
  const recipe = recipeOf(job)
  return job && recipe ? Math.min(1, job.ms / recipe.cookMs) : 0
}
export function jobReady(job: KitchenJob | null): boolean {
  const recipe = recipeOf(job)
  return !!job && !!recipe && job.ms >= recipe.cookMs
}
// Chỉ số mẻ đã chín đầu tiên, -1 nếu không có.
export const kitchenReadyIndex = (s: GameState): number => s.kitchen.findIndex((j) => jobReady(j))
export const kitchenReady = (s: GameState): boolean => kitchenReadyIndex(s) >= 0
// Chỉ số ô nấu trống đầu tiên trong số ô đã mở, -1 nếu bận hết.
export const kitchenFreeSlot = (s: GameState): number => s.kitchen.slice(0, kitchenSlots(s)).findIndex((j) => j === null)
export const kitchenBusyCount = (s: GameState): number => s.kitchen.filter((j) => j !== null).length

// Bắt đầu một mẻ ở ô trống đầu tiên: kiểm tra mọi điều kiện TRƯỚC khi trừ nguyên liệu.
export function startCooking(s: GameState, recipeId: string): KitchenAction {
  const recipe = RECIPES.find((x) => x.id === recipeId)
  if (!recipe) return 'unknown-recipe'
  const slot = kitchenFreeSlot(s)
  if (slot < 0) return 'busy'
  if (Object.entries(recipe.inputs).some(([id, n]) => count(s, id) < n)) return 'no-ingredients'
  for (const [id, n] of Object.entries(recipe.inputs)) removeItem(s, id, n)
  s.kitchen[slot] = { recipe: recipeId, ms: 0 }
  return 'ok'
}

// Lấy thành phẩm của mẻ đã chín đầu tiên. Cần chỗ trong kho; đặt lại ô nấu TRƯỚC khi thưởng nên bấm lặp không nhân đôi.
export function collectCooked(s: GameState): KitchenAction {
  const i = kitchenReadyIndex(s)
  if (i < 0) return kitchenBusyCount(s) > 0 ? 'not-ready' : 'idle'
  const recipe = recipeOf(s.kitchen[i])!
  if (!hasRoom(s, recipe.yield)) return 'full'
  s.kitchen[i] = null
  addItem(s, recipe.output, recipe.yield)
  return 'ok'
}

// ---------- Đơn hàng ----------
export const isDone = (s: GameState, questId: string): boolean => s.flags.done.includes(questId)

// Đơn hàng hiện tại: đơn đầu tiên trong chuỗi chưa hoàn thành; null khi đã xong tất cả.
export function currentQuest(s: GameState): QuestDef | null {
  return QUESTS.find((q) => !isDone(s, q.id)) ?? null
}

export function questProgress(s: GameState, q: QuestDef): Array<{ id: string; need: number; have: number }> {
  return Object.entries(q.require).map(([id, need]) => ({ id, need, have: Math.min(count(s, id), need) }))
}

export type DeliverResult = 'ok' | 'no-quest' | 'not-enough'

// Giao đơn hàng hiện tại: kiểm tra đủ hàng TRƯỚC, rồi mới trừ hàng, cộng thưởng và đánh dấu xong
// (một lần duy nhất mỗi đơn, nên bấm lặp không nhận thưởng hai lần).
export function deliver(s: GameState): DeliverResult {
  const q = currentQuest(s)
  if (!q) return 'no-quest'
  if (questProgress(s, q).some((p) => p.have < p.need)) return 'not-enough'
  for (const [id, need] of Object.entries(q.require)) removeItem(s, id, need)
  s.money += q.rewardMoney
  s.flags.done.push(q.id)
  return 'ok'
}

export function giveStarter(s: GameState): boolean {
  if (s.flags.gotStarter) return false
  addItem(s, STARTER_SEEDS.id, STARTER_SEEDS.qty)
  s.flags.gotStarter = true
  return true
}

// ---------- Lưu / đọc ----------
export function serializeSave(s: GameState): string {
  return JSON.stringify({ version: SAVE_VERSION, ...s })
}

type Rec = Record<string, unknown>
const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v)
const isNonNegInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0

// Trả về null nếu dữ liệu thiếu/hỏng/sai phiên bản: game bắt đầu lại thay vì sập.
export function parseSave(
  json: string,
  plotIds: string[],
  mapIds: string[] = MAP_IDS,
  slotIds: string[] = ALL_ANIMAL_SLOT_IDS,
): GameState | null {
  let d: unknown
  try {
    d = JSON.parse(json)
  } catch {
    return null
  }
  if (!isRec(d) || ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, SAVE_VERSION].includes(d.version as number)) return null
  const version = d.version as number
  let map = version < 11 ? 'farm' : START_MAP // phiên bản 1: chưa có bản đồ (khi đó chỉ có nông trại)
  if (d.version !== 1) {
    if (typeof d.map !== 'string') return null
    if (version < 11 && d.map === 'house') map = 'hub' // bản đồ trong nhà đã bỏ: chuyển ra khu chợ
    else if (!mapIds.includes(d.map)) return null
    else map = d.map
  }
  if (!isNonNegInt(d.money)) return null
  let money = version < 12 ? d.money + START_MONEY : d.money // bản 12: tặng thêm tiền khởi đầu cho save cũ

  if (!isRec(d.inventory)) return null
  const inventory: Record<string, number> = {}
  for (const [id, qty] of Object.entries(d.inventory)) {
    if (id === 'seed_fish' && version < 14 && isNonNegInt(qty)) {
      money += qty * ANIMALS.fish.price // bản 14: cá giống không còn, hoàn tiền mua
      continue
    }
    if (!(id in ITEMS) || !isNonNegInt(qty)) return null
    if (qty > 0) inventory[id] = qty
  }

  if (!isRec(d.plots)) return null
  const plots: Record<string, PlotState> = {}
  for (const id of plotIds) {
    const p = d.plots[id]
    if (p === undefined) {
      plots[id] = { planted: false, crop: '', watered: false, growMs: 0 } // ô đất mới thêm sau khi lưu
      continue
    }
    if (!isRec(p)) return null
    if (typeof p.planted !== 'boolean' || typeof p.watered !== 'boolean') return null
    if (typeof p.growMs !== 'number' || !Number.isFinite(p.growMs) || p.growMs < 0) return null
    let crop: string
    if (d.version !== 1 && d.version !== 2) {
      // Phiên bản 3 trở lên: ô đang trồng phải có loại cây hợp lệ; ô trống phải để ''.
      if (typeof p.crop !== 'string') return null
      if (p.planted ? !(p.crop in CROPS) : p.crop !== '') return null
      crop = p.crop
    } else {
      crop = p.planted ? 'seed_carrot' : '' // bản cũ: chỉ có cà rốt
    }
    plots[id] = { planted: p.planted, crop, watered: p.watered, growMs: p.growMs }
  }

  if (!isRec(d.flags) || typeof d.flags.gotStarter !== 'boolean') return null
  let done: string[] = [] // phiên bản dưới 4: chưa có đơn hàng
  if (version >= 4) {
    const raw = d.flags.done
    // Chỉ nhận ID đơn hàng đã biết, không trùng lặp.
    if (!Array.isArray(raw) || raw.some((q) => typeof q !== 'string' || !QUEST_IDS.includes(q)) || new Set(raw).size !== raw.length) return null
    done = raw as string[]
  }
  if (!isRec(d.player)) return null
  const { col, row } = d.player
  if (typeof col !== 'number' || typeof row !== 'number' || !Number.isFinite(col) || !Number.isFinite(row)) return null

  // Phiên bản dưới 5: ngày 1, đầu ngày, chưa nâng cấp.
  let day = 1
  let time = 0
  let upgrades: Record<string, number> = {}
  let legacyWarehouse = 0
  if (version >= 5) {
    if (!isNonNegInt(d.day) || d.day < 1) return null
    if (typeof d.time !== 'number' || !Number.isFinite(d.time) || d.time < 0 || d.time >= DAY_MS) return null
    if (!isRec(d.upgrades)) return null
    upgrades = {}
    for (const [id, lv] of Object.entries(d.upgrades)) {
      if (id === 'stamina') continue // nâng cấp thể lực đã bị bỏ cùng hệ thống năng lượng
      if (id === 'warehouse' && version < 10) {
        // nâng cấp nhà kho cũ chuyển thành cấp mở rộng nhà kho
        if (!isNonNegInt(lv) || lv < 1 || lv > ZONES.warehouse.costs.length) return null
        legacyWarehouse = lv
        continue
      }
      const def = UPGRADES.find((u) => u.id === id)
      if (!def || !UPGRADE_IDS.includes(id) || !isNonNegInt(lv) || lv < 1 || lv > def.costs.length) return null
      upgrades[id] = lv
    }
    day = d.day
    time = d.time
  }

  // Vật nuôi: phiên bản dưới 6 chưa có (chuồng trống); chỗ mới thêm sau khi lưu cũng được tạo trống.
  const animals: Record<string, AnimalState> = {}
  const rawAnimals = version >= 6 ? d.animals : {}
  if (!isRec(rawAnimals)) return null
  for (const id of slotIds) {
    const a = rawAnimals[id]
    if (a === undefined) {
      animals[id] = emptyAnimal()
      continue
    }
    if (!isRec(a) || typeof a.kind !== 'string' || typeof a.fed !== 'boolean') return null
    if (typeof a.prodMs !== 'number' || !Number.isFinite(a.prodMs) || a.prodMs < 0) return null
    if (a.kind === '') {
      if (a.fed || a.prodMs !== 0) return null // chỗ trống không thể đang ăn hay có tiến độ
    } else {
      const def = ANIMALS[a.kind]
      if (!def || a.prodMs > def.produceMs) return null // loài lạ hoặc tiến độ vượt mức
      if (!a.fed && a.prodMs !== 0) return null // chưa ăn thì chưa có tiến độ
    }
    animals[id] = { kind: a.kind, fed: a.fed, prodMs: a.prodMs }
  }

  // Bản 12: gà, vịt thả rông. Con nào còn ở chỗ chuồng (save cũ) chuyển sang chỗ thả rông trống; hết chỗ thì hoàn tiền mua.
  if (version < 12) {
    for (const id of slotIds.filter((x) => !isFreeSlot(x))) {
      const a = animals[id]
      const def = ANIMALS[a.kind]
      if (!def || def.home !== 'free') continue
      const target = slotIds.find((x) => isFreeSlot(x) && animals[x].kind === '')
      if (target !== undefined) animals[target] = a
      else money += def.price
      animals[id] = emptyAnimal()
    }
  }
  // Bản 14: cá là vật nuôi trong hồ (không còn là cây ở ô nước). Cá đang nuôi ở ô nước cũ pond_r_c chuyển sang chỗ fish_r_c cùng vị trí.
  if (version < 14) {
    for (const [pid, p] of Object.entries(d.plots)) {
      const m = /^pond_(\d)_(\d)$/.exec(pid)
      if (!m || !isRec(p) || p.planted !== true || typeof p.growMs !== 'number') continue
      const target = `fish_${m[1]}_${m[2]}`
      if (animals[target]?.kind === '') animals[target] = { kind: 'fish', fed: true, prodMs: Math.max(0, Math.min(ANIMALS.fish.produceMs, p.growMs)) }
    }
  }
  // Từ bản 12: loài thả rông chỉ ở chỗ thả rông, heo và bò chỉ ở chuồng.
  for (const id of slotIds) {
    const def = ANIMALS[animals[id].kind]
    if (def && def.home !== slotHome(id)) return null
  }

  // Bản 16: ổ trứng gà/vịt. Chỉ nhận loài thả rông, số trứng trong [0, NEST_CAP].
  const nests: Record<string, number> = {}
  if (version >= 16) {
    if (!isRec(d.nests)) return null
    for (const [k, v] of Object.entries(d.nests)) {
      const def = Object.values(ANIMALS).find((x) => x.home === 'free' && x.product === k)
      if (!def || !isNonNegInt(v) || v > NEST_CAP) return null
      nests[k] = v
    }
  }

  // Bản đồ nông trại được bố trí lại từ bản 9: vị trí cũ ở nông trại không còn ý nghĩa, về điểm xuất phát.
  const resetPos = version < 11 // bản 11 làm lại toàn bộ bản đồ
  // Mở rộng các khu: bản 9 có `zones`; bản 7-8 chỉ có `expansion` (ruộng); bản dưới 7 chưa có.
  const zones: ZoneLevels = { ...NO_ZONE_LEVELS }
  if (version >= 9) {
    if (!isRec(d.zones)) return null
    for (const z of ZONE_IDS) {
      const lv = d.zones[z]
      if (lv === undefined && version < 10) continue // bản 9 chưa có nhà bếp, nhà kho
      if (!isNonNegInt(lv)) return null
      if (lv > ZONES[z].costs.length) {
        if (z === 'pond' && version < 11) zones[z] = ZONES[z].costs.length // hồ cá bản cũ có 3 cấp, nay tối đa 2
        else return null
        continue
      }
      zones[z] = lv
    }
  } else if (version >= 7) {
    if (!isNonNegInt(d.expansion) || d.expansion > ZONES.field.costs.length) return null
    zones.field = d.expansion
  }
  // Bản 13: mỗi cấp ruộng là 1 ô đất (trước đây 1 cấp = 1 lô). Cấp cũ k (lô thứ 0..k đã mở) đổi thành 15k để các lô đó mở đủ ô.
  if (version < 13) zones.field = Math.min(zones.field * 15, ZONES.field.costs.length)
  // Bản 15: mỗi lô ruộng 18 ô (trước 15). Số ô đang mở n = 9 + cấp; lô đầy giữ nguyên, ô lẻ của lô cuối giữ nguyên vị trí (cột trước, hàng sau).
  if (version < 15) {
    const n = 9 + zones.field
    zones.field = Math.min(Math.floor(n / 15) * 18 + (n % 15) - 9, ZONES.field.costs.length)
  }
  zones.warehouse = Math.max(zones.warehouse, legacyWarehouse)

  // Nhà bếp: bản 10 là mảng các mẻ; bản 8-9 chỉ có một mẻ; bản dưới 8 chưa có. Mẻ phải dùng công thức đã biết,
  // tiến độ trong [0, cookMs], và chỉ nằm trong số ô nấu đã mở.
  const kitchen: Array<KitchenJob | null> = Array.from({ length: KITCHEN_MAX_SLOTS }, () => null)
  const parseJob = (k: unknown): KitchenJob | null | undefined => {
    if (k === null) return null
    if (!isRec(k) || typeof k.recipe !== 'string' || typeof k.ms !== 'number') return undefined
    const recipe = RECIPES.find((x) => x.id === k.recipe)
    if (!recipe || !Number.isFinite(k.ms) || k.ms < 0 || k.ms > recipe.cookMs) return undefined
    return { recipe: recipe.id, ms: k.ms }
  }
  const openSlots = Math.min(KITCHEN_MAX_SLOTS, 1 + zones.kitchen)
  if (version >= 10) {
    if (!Array.isArray(d.kitchen) || d.kitchen.length !== KITCHEN_MAX_SLOTS) return null
    for (let i = 0; i < KITCHEN_MAX_SLOTS; i++) {
      const job = parseJob(d.kitchen[i])
      if (job === undefined || (job !== null && i >= openSlots)) return null
      kitchen[i] = job
    }
  } else if (version >= 8) {
    const job = parseJob(d.kitchen)
    if (job === undefined) return null
    kitchen[0] = job
  }

  return {
    money,
    inventory,
    plots,
    flags: { gotStarter: d.flags.gotStarter, done },
    map,
    player: resetPos ? { col: (MAPS[map] ?? MAPS.farm).start.col, row: (MAPS[map] ?? MAPS.farm).start.row } : { col, row },
    day,
    time,
    upgrades,
    animals,
    zones,
    nests,
    kitchen,
  }
}
