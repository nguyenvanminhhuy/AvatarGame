// Test cho nhà bếp (chế biến) và nhà kho (sức chứa), lưu phiên bản 8.
import test from 'node:test'
import assert from 'node:assert/strict'
import * as G from '../src/state/GameState.ts'
import { RECIPES } from '../src/data/recipes.ts'
import { ITEMS } from '../src/data/items.ts'
import { BASE_CAPACITY, CAPACITY_PER_LEVEL } from '../src/data/upgrades.ts'
import { KITCHEN_MAX_SLOTS } from '../src/data/recipes.ts'

const IDS = ['a', 'b']
const fresh = () => {
  const s = G.newGame(IDS, { col: 1, row: 1 })
  s.money = 0
  return s
}
const SAUCE = RECIPES.find((r) => r.id === 'tomato_sauce')!

test('công thức hợp lệ: nguyên liệu và thành phẩm có trong catalog, thành phẩm bán cao hơn nguyên liệu', () => {
  for (const r of RECIPES) {
    assert.ok(r.output in ITEMS && ITEMS[r.output].sellPrice !== undefined, `${r.id}: thành phẩm`)
    let inputValue = 0
    for (const [id, n] of Object.entries(r.inputs)) {
      assert.ok(id in ITEMS, `${r.id}: nguyên liệu ${id}`)
      inputValue += (ITEMS[id].sellPrice ?? 0) * n
    }
    assert.ok(ITEMS[r.output].sellPrice! * r.yield > inputValue, `${r.id}: chế biến phải có lời`)
  }
})

test('có công thức cho cá, sữa bò và nấm cục', () => {
  const used = new Set(RECIPES.flatMap((r) => Object.keys(r.inputs)))
  for (const id of ['fish', 'milk', 'truffle']) assert.ok(used.has(id), `chưa có công thức dùng ${id}`)
})

test('nấu: thiếu nguyên liệu thì không đổi gì, đủ thì trừ đúng và bắt đầu, bếp bận hết thì từ chối', () => {
  const s = fresh()
  G.addItem(s, 'tomato', 1)
  assert.equal(G.startCooking(s, 'tomato_sauce'), 'no-ingredients')
  assert.equal(G.count(s, 'tomato'), 1)
  assert.deepEqual(s.kitchen, [null, null, null])
  assert.equal(G.startCooking(s, 'khong_co'), 'unknown-recipe')
  G.addItem(s, 'tomato', 3)
  assert.equal(G.startCooking(s, 'tomato_sauce'), 'ok')
  assert.equal(G.count(s, 'tomato'), 2)
  assert.equal(G.startCooking(s, 'tomato_sauce'), 'busy') // cấp 0 chỉ 1 mẻ
  assert.equal(G.count(s, 'tomato'), 2) // bận: không mất nguyên liệu
})

test('mở rộng nhà bếp: thêm mẻ nấu cùng lúc theo cấp, mẻ chạy độc lập', () => {
  const s = fresh()
  assert.equal(G.kitchenSlots(s), 1)
  s.money = 100_000
  assert.equal(G.buyZone(s, 'kitchen'), 'ok')
  assert.equal(G.kitchenSlots(s), 2)
  G.addItem(s, 'tomato', 2)
  G.addItem(s, 'carrot', 3)
  assert.equal(G.startCooking(s, 'tomato_sauce'), 'ok')
  G.tick(s, SAUCE.cookMs / 2)
  assert.equal(G.startCooking(s, 'carrot_juice'), 'ok') // mẻ thứ hai bắt đầu muộn hơn
  assert.equal(G.startCooking(s, 'carrot_juice'), 'busy') // 2/2 ô
  G.tick(s, SAUCE.cookMs / 2) // mẻ đầu xong, mẻ hai chưa
  assert.equal(G.kitchenReadyIndex(s), 0)
  assert.equal(G.collectCooked(s), 'ok')
  assert.equal(G.count(s, 'sauce'), 1)
  assert.equal(s.kitchen[1]!.recipe, 'carrot_juice') // mẻ hai vẫn chạy
  assert.equal(G.collectCooked(s), 'not-ready')
  G.buyZone(s, 'kitchen')
  assert.equal(G.kitchenSlots(s), KITCHEN_MAX_SLOTS)
  assert.equal(G.buyZone(s, 'kitchen'), 'max-level')
})

test('nấu xong theo thời gian, lấy một lần, không nhân đôi', () => {
  const s = fresh()
  G.addItem(s, 'tomato', 2)
  G.startCooking(s, 'tomato_sauce')
  assert.equal(G.collectCooked(s), 'not-ready')
  G.tick(s, SAUCE.cookMs / 2)
  assert.equal(G.jobProgress(s.kitchen[0]), 0.5)
  assert.equal(G.kitchenReady(s), false)
  G.tick(s, SAUCE.cookMs * 2) // vượt: chặn ở mức tối đa
  assert.equal(s.kitchen[0]!.ms, SAUCE.cookMs)
  assert.equal(G.kitchenReady(s), true)
  assert.equal(G.collectCooked(s), 'ok')
  assert.equal(G.count(s, 'sauce'), 1)
  assert.equal(s.kitchen[0], null)
  assert.equal(G.collectCooked(s), 'idle')
  assert.equal(G.count(s, 'sauce'), 1)
})

test('kho đầy: không thu hoạch, không nhặt trứng, không mua, không lấy thành phẩm; không mất gì', () => {
  const s = fresh()
  s.money = 10_000
  s.zones.pen = 1
  s.plots.a = { planted: true, crop: 'seed_carrot', watered: true, growMs: 99_999 }
  G.buyAnimal(s, 'chicken')
  const slot = Object.keys(s.animals).find((id) => s.animals[id].kind)!
  s.animals[slot].fed = true
  s.animals[slot].prodMs = 40_000
  G.addItem(s, 'carrot', G.capacity(s) - G.totalItems(s)) // đầy đúng sức chứa
  assert.equal(G.totalItems(s), BASE_CAPACITY)
  assert.equal(G.harvest(s, 'a'), 'full')
  assert.equal(s.plots.a.planted, true) // cây vẫn còn
  assert.equal(G.collectProduct(s, slot), 'full')
  assert.equal(s.animals[slot].fed, true) // vẫn chín, chưa mất
  const money = s.money
  assert.equal(G.buy(s, 'seed_carrot'), 'full')
  assert.equal(s.money, money) // không trừ tiền
  s.kitchen[0] = { recipe: 'tomato_sauce', ms: SAUCE.cookMs }
  assert.equal(G.collectCooked(s), 'full')
  assert.ok(s.kitchen[0] !== null) // thành phẩm vẫn ở nhà bếp
  G.sellAll(s, 'carrot') // có chỗ trống lại
  assert.equal(G.harvest(s, 'a'), 'ok')
})

test('mở rộng nhà kho tăng sức chứa theo cấp (cấp, giá và giới hạn từ ZONES)', () => {
  const s = fresh()
  assert.equal(G.capacity(s), BASE_CAPACITY)
  s.money = 100_000
  assert.equal(G.buyZone(s, 'warehouse'), 'ok')
  assert.equal(G.capacity(s), BASE_CAPACITY + CAPACITY_PER_LEVEL)
  assert.equal(G.hasRoom(s, BASE_CAPACITY + CAPACITY_PER_LEVEL), true)
  assert.equal(G.hasRoom(s, BASE_CAPACITY + CAPACITY_PER_LEVEL + 1), false)
})

test('save v10: ghi/đọc các mẻ; mẻ sai bị từ chối; bản cũ đổi sang mảng; nâng cấp kho cũ thành mở rộng nhà kho', () => {
  const s = fresh()
  s.zones.kitchen = 1
  s.kitchen[0] = { recipe: 'omelette', ms: 1234 }
  s.kitchen[1] = { recipe: 'cheese', ms: 10 }
  assert.deepEqual(G.parseSave(G.serializeSave(s), IDS), s)
  const base = JSON.parse(G.serializeSave(fresh()))
  const mut = (k: unknown) => G.parseSave(JSON.stringify({ ...base, kitchen: k }), IDS)
  assert.notEqual(mut([null, null, null]), null)
  assert.equal(mut([{ recipe: 'khong_co', ms: 0 }, null, null]), null)
  assert.equal(mut([{ recipe: 'omelette', ms: -1 }, null, null]), null)
  assert.equal(mut([{ recipe: 'omelette', ms: 99_999_999 }, null, null]), null) // vượt thời gian nấu
  assert.equal(mut([null, { recipe: 'omelette', ms: 0 }, null]), null) // ô nấu chưa mở (nhà bếp cấp 0)
  assert.equal(mut([null, null]), null) // sai độ dài
  assert.equal(mut('x'), null)
  assert.equal(mut(undefined), null)
  // bản 8 (một mẻ) -> mảng
  const v8 = { ...base, version: 8, kitchen: { recipe: 'omelette', ms: 5 }, expansion: 1 }
  delete v8.zones
  const back8 = G.parseSave(JSON.stringify(v8), IDS)!
  assert.deepEqual(back8.kitchen, [{ recipe: 'omelette', ms: 5 }, null, null])
  assert.equal(back8.zones.field, 18) // cấp ruộng cũ 1 (một lô thêm): 15 ô (bản 13) rồi 18 ô/lô (bản 15)
  // bản 9: zones chỉ có 3 khu; nâng cấp 'warehouse' cũ chuyển thành mở rộng nhà kho
  const v9 = { ...base, version: 9, kitchen: null, zones: { pen: 1, field: 0, pond: 0 }, upgrades: { warehouse: 2, fertilizer: 1 } }
  const back9 = G.parseSave(JSON.stringify(v9), IDS)!
  assert.equal(back9.zones.warehouse, 2)
  assert.equal(back9.zones.pen, 1)
  assert.deepEqual(back9.upgrades, { fertilizer: 1 })
  assert.deepEqual(back9.kitchen, [null, null, null])
  // vị trí bản cũ về điểm xuất phát của bản đồ; bản đồ trong nhà (đã bỏ) chuyển ra khu chợ
  const old = { ...base, version: 7, map: 'farm', player: { col: 3, row: 6.5 }, expansion: 0, kitchen: null }
  delete old.zones
  assert.deepEqual(G.parseSave(JSON.stringify(old), IDS)!.player, { col: MAPS.farm.start.col, row: MAPS.farm.start.row })
  const oldHouse = { ...old, map: 'house', player: { col: 5, row: 5 } }
  const backHouse = G.parseSave(JSON.stringify(oldHouse), IDS)!
  assert.equal(backHouse.map, 'hub')
  assert.deepEqual(backHouse.player, { col: MAPS.hub.start.col, row: MAPS.hub.start.row })
})

// ---------- Hồ cá (cá là vật nuôi trong hồ từ bản 14; chi tiết rải thức ăn, mua cá ở Animals.test.ts) ----------
import { MAPS } from '../src/data/world.ts'
import { ANIMALS } from '../src/data/animals.ts'

test('cá: giá mua có lời, hồ có sẵn từ đầu (không cần nhiệm vụ), không còn ô nước kiểu cây trồng', () => {
  assert.ok(ITEMS.fish.sellPrice! > ANIMALS.fish.price)
  assert.equal(ANIMALS.fish.unlock, undefined)
  assert.equal(MAPS.farm.plots.length, 9) // chỉ còn ô ruộng
  assert.ok(MAPS.farm.animalSlots.filter((s) => s.pond).length >= 9) // hồ cấp 0 có 3 x 3 chỗ cá
})

test('save cũ (bản 13): cá giống hoàn tiền, cá đang nuôi ở ô nước cũ chuyển thành cá trong hồ', () => {
  const s = fresh()
  const raw = JSON.parse(G.serializeSave(s))
  const old = { ...raw, version: 13, money: 100, inventory: { seed_fish: 2, carrot: 1 }, plots: { ...raw.plots, pond_0_1: { planted: true, crop: 'seed_fish', watered: true, growMs: 20000 } } }
  const back = G.parseSave(JSON.stringify(old), IDS)!
  assert.equal(back.money, 100 + 2 * ANIMALS.fish.price) // hoàn tiền cá giống
  assert.equal(back.inventory.seed_fish, undefined)
  assert.deepEqual(back.animals['fish_0_1'], { kind: 'fish', fed: true, prodMs: 20000 })
  assert.equal(back.animals['fish_0_0'].kind, '')
})
