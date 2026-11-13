// Test cho vật nuôi: mua, cho ăn, ra sản phẩm, nhặt, lưu phiên bản 6.
import test from 'node:test'
import assert from 'node:assert/strict'
import * as G from '../src/state/GameState.ts'
import { ANIMALS, NEST_CAP } from '../src/data/animals.ts'
import { ITEMS, START_MONEY } from '../src/data/items.ts'
const ITEMS_SELL = (id: string) => ITEMS[id].sellPrice!
import { ALL_ANIMAL_SLOT_IDS, ALL_FREE_SLOT_IDS, ALL_PEN_SLOT_IDS, MAPS, NO_ZONE_LEVELS, isFreeSlot, unlockMet } from '../src/data/world.ts'

const PLOTS = ['a', 'b']
const fresh = () => {
  const s = G.newGame(PLOTS, { col: 1, row: 1 })
  s.money = 0
  s.zones.pen = 3 // mở rộng tối đa: mở khóa mọi vật nuôi và thức ăn
  return s
}
const SLOT = ALL_FREE_SLOT_IDS[0] // chỗ thả rông đầu tiên (gà)
const CHICKEN = ANIMALS.chicken

test('gà và thức ăn bị khóa đến khi mở rộng khu chăn nuôi lên cấp 1', () => {
  const s = G.newGame(PLOTS, { col: 1, row: 1 })
  s.money = 10_000
  assert.equal(G.isAnimalBuyable(s, 'chicken'), false)
  assert.equal(G.buyAnimal(s, 'chicken'), 'locked')
  assert.equal(s.money, 10_000) // không mất tiền khi bị khóa
  assert.equal(G.isBuyable(s, 'feed'), false) // thức ăn cũng khóa
  s.zones.pen = 1
  assert.equal(G.isAnimalBuyable(s, 'chicken'), true)
  assert.equal(G.isBuyable(s, 'feed'), true)
})

test('mua vật nuôi: đúng giá, không đủ tiền thì không đổi gì, hết chỗ thì từ chối', () => {
  const s = fresh()
  s.money = CHICKEN.price - 1
  assert.equal(G.buyAnimal(s, 'chicken'), 'no-money')
  assert.equal(s.money, CHICKEN.price - 1)
  assert.equal(G.animalCount(s), 0)
  s.money = 100_000
  assert.equal(G.buyAnimal(s, 'ngua'), 'unknown-kind')
  for (let i = 0; i < G.freeCapacity(s); i++) assert.equal(G.buyAnimal(s, 'chicken'), 'ok')
  assert.equal(G.animalCount(s), G.freeCapacity(s))
  const money = s.money
  assert.equal(G.buyAnimal(s, 'duck'), 'full')
  assert.equal(s.money, money) // bãi thả rông đầy: không trừ tiền
})

test('mua vật nuôi đặt vào chỗ trống đầu tiên theo thứ tự', () => {
  const s = fresh()
  s.money = 10_000
  G.buyAnimal(s, 'chicken')
  G.buyAnimal(s, 'duck')
  assert.equal(s.animals[ALL_FREE_SLOT_IDS[0]].kind, 'chicken')
  assert.equal(s.animals[ALL_FREE_SLOT_IDS[1]].kind, 'duck')
  assert.equal(s.animals[ALL_FREE_SLOT_IDS[2]].kind, '')
  assert.equal(s.animals[ALL_PEN_SLOT_IDS[0]].kind, '') // gà, vịt không vào chuồng
})

test('rải thức ăn: cần đúng thức ăn của loài, thất bại không mất gì, con đã ăn không bị trừ thêm', () => {
  const s = fresh()
  assert.equal(G.feedHome(s, 'free').result, 'none-hungry') // chưa có con nào
  s.money = 1000
  G.buyAnimal(s, 'chicken')
  const r0 = G.feedHome(s, 'free')
  assert.equal(r0.result, 'no-feed')
  assert.deepEqual(r0.missing, ['feed'])
  assert.equal(s.animals[SLOT].fed, false)
  G.addItem(s, 'feed', 2)
  const r1 = G.feedHome(s, 'free')
  assert.equal(r1.result, 'ok')
  assert.equal(r1.fed, 1)
  assert.equal(G.count(s, 'feed'), 1)
  assert.equal(G.feedHome(s, 'free').result, 'none-hungry')
  assert.equal(G.count(s, 'feed'), 1) // không trừ thêm
})

test('một lần rải cho cả nhóm: mỗi con đói dùng 1 phần đúng loại; thiếu thì con còn lại vẫn đói', () => {
  const s = fresh()
  s.money = 100_000
  for (const k of ['chicken', 'chicken', 'duck']) G.buyAnimal(s, k)
  G.buyAnimal(s, 'pig')
  G.buyAnimal(s, 'cow')
  assert.equal(G.hungryCount(s, 'free'), 3)
  assert.equal(G.hungryCount(s, 'pen'), 2)
  G.addItem(s, 'feed', 2)
  const r = G.feedHome(s, 'free')
  assert.deepEqual([r.result, r.fed, r.missing], ['ok', 2, ['feed']])
  assert.equal(G.hungryCount(s, 'free'), 1)
  assert.equal(G.count(s, 'feed'), 0)
  // máng chuồng: heo ăn cám heo, bò ăn cỏ khô; thóc không dùng được
  G.addItem(s, 'feed', 5)
  assert.deepEqual(G.feedHome(s, 'pen').missing.sort(), ['feed_cow', 'feed_pig'])
  G.addItem(s, 'feed_pig', 1)
  const rp = G.feedHome(s, 'pen')
  assert.deepEqual([rp.result, rp.fed, rp.missing], ['ok', 1, ['feed_cow']])
  G.addItem(s, 'feed_cow', 1)
  assert.equal(G.feedHome(s, 'pen').fed, 1)
  assert.equal(G.hungryCount(s, 'pen'), 0)
})

test('hồ cá: mua cá vào ô nước theo cấp hồ, rải thức ăn cá, vớt cá', () => {
  const s = fresh()
  s.money = 100_000
  assert.equal(G.homeCapacity(s, 'pond'), 9) // hồ cấp 0: 3 x 3
  for (let i = 0; i < 9; i++) assert.equal(G.buyAnimal(s, 'fish'), 'ok')
  assert.equal(G.buyAnimal(s, 'fish'), 'full')
  s.zones.pond = 1
  assert.equal(G.homeCapacity(s, 'pond'), 12) // 4 x 3: hồ rộng ra
  assert.equal(G.buyAnimal(s, 'fish'), 'ok')
  s.zones.pond = 2
  assert.equal(G.homeCapacity(s, 'pond'), 16) // 4 x 4
  G.addItem(s, 'feed_fish', 7)
  const r = G.feedHome(s, 'pond')
  assert.deepEqual([r.result, r.fed], ['ok', 7])
  G.tick(s, ANIMALS.fish.produceMs)
  const id = Object.keys(s.animals).find((k) => s.animals[k].kind === 'fish')!
  assert.equal(G.collectProduct(s, id), 'ok')
  assert.equal(G.count(s, 'fish'), 1)
  assert.equal(G.parseSave(G.serializeSave(s), PLOTS)!.animals[id].kind, 'fish') // vớt xong cá vẫn còn (đói), lưu lại đọc được
})

test('sản phẩm chỉ tích lũy khi đã ăn, ra đúng thời gian, nhặt một lần (heo ở chuồng)', () => {
  const s = fresh()
  s.money = 1000
  const PIG = ANIMALS.pig
  G.buyAnimal(s, 'pig')
  const slot = ALL_PEN_SLOT_IDS[0]
  G.addItem(s, PIG.feed, 3)
  G.tick(s, PIG.produceMs) // chưa ăn: không tiến
  assert.equal(s.animals[slot].prodMs, 0)
  assert.equal(G.collectProduct(s, slot), 'not-ready')
  G.feedHome(s, 'pen')
  G.tick(s, PIG.produceMs / 2)
  assert.equal(G.animalReady(s.animals[slot]), false)
  assert.equal(G.animalProgress(s.animals[slot]), 0.5)
  assert.equal(G.collectProduct(s, slot), 'not-ready')
  G.tick(s, PIG.produceMs) // vượt quá: bị chặn ở mức tối đa
  assert.equal(s.animals[slot].prodMs, PIG.produceMs)
  assert.equal(G.animalReady(s.animals[slot]), true)
  assert.equal(G.collectProduct(s, slot), 'ok')
  assert.equal(G.count(s, PIG.product), PIG.yield)
  assert.equal(s.animals[slot].fed, false) // phải cho ăn lại
  assert.equal(G.collectProduct(s, slot), 'not-ready') // bấm lặp không nhân đôi
  assert.equal(G.count(s, PIG.product), PIG.yield)
})

test('gà, vịt tự đẻ vào ổ rồi chờ thức ăn; lấy hết trứng từng loài một lần', () => {
  const s = fresh()
  s.money = 5000
  G.buyAnimal(s, 'chicken')
  G.buyAnimal(s, 'chicken')
  G.buyAnimal(s, 'duck')
  G.addItem(s, 'feed', 6)
  G.feedHome(s, 'free')
  G.tick(s, ANIMALS.duck.produceMs) // đủ lâu cho cả gà và vịt
  assert.equal(s.nests.egg, 2 * ANIMALS.chicken.yield)
  assert.equal(s.nests.duck_egg, ANIMALS.duck.yield)
  assert.equal(G.count(s, 'egg'), 0) // chưa vào kho
  assert.ok(Object.values(s.animals).filter((a) => a.kind).every((a) => !a.fed && a.prodMs === 0)) // chờ thức ăn lần sau
  assert.equal(G.hungryCount(s, 'free'), 3)
  const r = G.collectNest(s, 'egg')
  assert.deepEqual(r, { result: 'ok', taken: 2 * ANIMALS.chicken.yield })
  assert.equal(G.count(s, 'egg'), 2 * ANIMALS.chicken.yield)
  assert.equal(s.nests.egg, 0)
  assert.equal(s.nests.duck_egg, ANIMALS.duck.yield) // trứng vịt không bị lấy theo
  assert.equal(G.collectNest(s, 'egg').result, 'empty')
})

test('ổ đầy thì gà giữ trứng; kho gần đầy chỉ lấy được một phần', () => {
  const s = fresh()
  s.money = 5000
  s.nests.egg = NEST_CAP
  G.buyAnimal(s, 'chicken')
  G.addItem(s, 'feed', 1)
  G.feedHome(s, 'free')
  G.tick(s, ANIMALS.chicken.produceMs)
  assert.equal(s.nests.egg, NEST_CAP) // không đẻ thêm
  assert.equal(G.animalReady(s.animals[ALL_FREE_SLOT_IDS[0]]), true)
  G.addItem(s, 'carrot', G.capacity(s) - G.totalItems(s) - 5) // còn 5 chỗ
  assert.deepEqual(G.collectNest(s, 'egg'), { result: 'ok', taken: 5 })
  assert.equal(s.nests.egg, NEST_CAP - 5)
  assert.equal(G.collectNest(s, 'egg').result, 'full')
})

test('lưu/đọc giữ trứng trong ổ; save cũ chưa có ổ thì ổ trống; ổ sai bị từ chối', () => {
  const s = fresh()
  s.nests.duck_egg = 3
  const back = G.parseSave(G.serializeSave(s), PLOTS)!
  assert.deepEqual(back.nests, { duck_egg: 3 })
  const old = JSON.parse(G.serializeSave(s))
  delete old.nests
  old.version = 15
  assert.deepEqual(G.parseSave(JSON.stringify(old), PLOTS)!.nests, {})
  const bad = JSON.parse(G.serializeSave(s))
  bad.nests = { milk: 2 }
  assert.equal(G.parseSave(JSON.stringify(bad), PLOTS), null)
})

test('vịt chậm hơn gà và trứng bán giá khác nhau; bán hết nông sản gồm cả trứng', () => {
  assert.ok(ANIMALS.duck.produceMs > ANIMALS.chicken.produceMs)
  const s = fresh()
  G.addItem(s, 'egg', 2)
  G.addItem(s, 'duck_egg', 1)
  assert.equal(G.sellAllProduce(s), 2 * 40 + 80)
  assert.equal(G.count(s, 'egg'), 0)
})

test('mua thức ăn ở cửa hàng sau khi mở khóa', () => {
  const s = fresh()
  s.money = 7
  assert.equal(G.buy(s, 'feed'), 'no-money')
  s.money = 20
  assert.equal(G.buy(s, 'feed'), 'ok')
  assert.equal(s.money, 12)
  assert.equal(G.count(s, 'feed'), 1)
})

test('save v6: ghi rồi đọc lại đủ vật nuôi', () => {
  const s = fresh()
  s.money = 5000
  G.buyAnimal(s, 'chicken')
  G.buyAnimal(s, 'duck')
  G.addItem(s, 'feed', 2)
  G.feedHome(s, 'free')
  G.tick(s, 12_345)
  const back = G.parseSave(G.serializeSave(s), PLOTS)
  assert.deepEqual(back, s)
})

test('save: bản cũ version 5 (chưa có vật nuôi) được đọc với chuồng trống', () => {
  const s = fresh()
  G.giveStarter(s)
  const old = JSON.parse(G.serializeSave(s))
  old.version = 5
  delete old.animals
  const back = G.parseSave(JSON.stringify(old), PLOTS)
  assert.notEqual(back, null)
  assert.equal(G.animalCount(back!), 0)
  assert.deepEqual(Object.keys(back!.animals), ALL_ANIMAL_SLOT_IDS)
  assert.equal(G.count(back!, 'seed_carrot'), 3) // dữ liệu cũ giữ nguyên
})

test('save: chỗ vật nuôi mới thêm sau khi lưu được tạo trống', () => {
  const s = fresh()
  s.money = 1000
  G.buyAnimal(s, 'chicken')
  const old = JSON.parse(G.serializeSave(s))
  delete old.animals[ALL_ANIMAL_SLOT_IDS[3]]
  const back = G.parseSave(JSON.stringify(old), PLOTS)
  assert.notEqual(back, null)
  assert.equal(back!.animals[SLOT].kind, 'chicken')
  assert.deepEqual(back!.animals[ALL_ANIMAL_SLOT_IDS[3]], { kind: '', fed: false, prodMs: 0 })
})

test('save: version 6 với vật nuôi sai bị từ chối', () => {
  const s = fresh()
  s.money = 1000
  G.buyAnimal(s, 'chicken')
  G.addItem(s, 'feed', 1)
  G.feedHome(s, 'free')
  G.tick(s, 5000)
  const good = JSON.parse(G.serializeSave(s))
  const mut = (f: (d: any) => void) => {
    const d = structuredClone(good)
    f(d)
    return G.parseSave(JSON.stringify(d), PLOTS)
  }
  assert.notEqual(mut(() => {}), null)
  assert.equal(mut((d) => (d.animals[SLOT].kind = 'rong')), null) // loài lạ
  assert.equal(mut((d) => (d.animals[SLOT].prodMs = CHICKEN.produceMs + 1)), null) // tiến độ vượt mức
  assert.equal(mut((d) => (d.animals[SLOT].prodMs = -1)), null)
  assert.equal(mut((d) => (d.animals[SLOT].fed = 'co')), null)
  assert.equal(mut((d) => ((d.animals[SLOT].fed = false), (d.animals[SLOT].prodMs = 100))), null) // chưa ăn mà có tiến độ
  assert.equal(mut((d) => (d.animals[ALL_ANIMAL_SLOT_IDS[1]] = { kind: '', fed: true, prodMs: 0 })), null) // chỗ trống mà đang ăn
  assert.equal(mut((d) => (d.animals = 'khong')), null)
  assert.equal(mut((d) => delete d.animals), null) // v6 phải có animals
})

test('heo và bò: khóa đến khi mở rộng khu chăn nuôi (cấp 2 và 3), ở trong chuồng; sản phẩm đúng', () => {
  assert.equal(ALL_PEN_SLOT_IDS.length, 16) // chuồng mở rộng tối đa: 8 cột x 2 hàng
  assert.equal(ALL_FREE_SLOT_IDS.length, 12) // bãi thả rông tối đa: 3 + 3 x 3
  const s = G.newGame(PLOTS, { col: 1, row: 1 })
  s.money = 10_000
  s.zones.pen = 1
  assert.equal(G.buyAnimal(s, 'pig'), 'locked')
  assert.equal(G.buyAnimal(s, 'cow'), 'locked')
  assert.equal(s.money, 10_000)
  s.zones.pen = 2
  assert.equal(G.buyAnimal(s, 'pig'), 'ok')
  assert.equal(G.buyAnimal(s, 'cow'), 'locked') // bò cần cấp 3
  s.zones.pen = 3
  assert.equal(G.buyAnimal(s, 'cow'), 'ok')
  assert.equal(s.money, 10_000 - ANIMALS.pig.price - ANIMALS.cow.price)
  const [pigSlot, cowSlot] = ALL_PEN_SLOT_IDS
  assert.equal(s.animals[pigSlot].kind, 'pig')
  assert.equal(s.animals[cowSlot].kind, 'cow')
  assert.ok(!isFreeSlot(pigSlot))
  s.zones.pen = 3
  G.addItem(s, 'feed_pig', 1)
  G.addItem(s, 'feed_cow', 1)
  G.feedHome(s, 'pen')
  G.tick(s, ANIMALS.cow.produceMs)
  assert.equal(G.collectProduct(s, pigSlot), 'ok')
  assert.equal(G.collectProduct(s, cowSlot), 'ok')
  assert.equal(G.count(s, 'truffle'), 1)
  assert.equal(G.count(s, 'milk'), 1)
})

test('vật nuôi đắt hơn thì chậm hơn nhưng lời hơn theo giây (gà < vịt < heo < bò)', () => {
  const rate = (k: string) => ITEMS_SELL(ANIMALS[k].product) / (ANIMALS[k].produceMs / 1000)
  const order = ['chicken', 'duck', 'pig', 'cow']
  for (let i = 1; i < order.length; i++) {
    assert.ok(ANIMALS[order[i]].price > ANIMALS[order[i - 1]].price, `${order[i]}: giá`)
    assert.ok(ANIMALS[order[i]].produceMs > ANIMALS[order[i - 1]].produceMs, `${order[i]}: thời gian`)
    assert.ok(rate(order[i]) >= rate(order[i - 1]) - 1e-9, `${order[i]}: lời theo giây`)
  }
})

test('mở rộng khu chăn nuôi: thêm chỗ thả rông và chỗ chuồng theo cấp, mua chỉ vào chỗ đã mở', () => {
  const s = fresh()
  s.zones.pen = 1
  s.money = 1_000_000
  assert.equal(G.penCapacity(s), 8)
  assert.equal(G.freeCapacity(s), 6)
  for (let i = 0; i < 6; i++) assert.equal(G.buyAnimal(s, 'chicken'), 'ok')
  assert.equal(G.buyAnimal(s, 'chicken'), 'full')
  assert.equal(G.homeCount(s, 'free'), 6)
  assert.equal(G.homeCount(s, 'pen'), 0)
  assert.equal(G.buyZone(s, 'pen'), 'ok')
  assert.equal(G.freeCapacity(s), 9)
  assert.equal(G.buyAnimal(s, 'chicken'), 'ok')
  assert.equal(s.animals[ALL_FREE_SLOT_IDS[6]].kind, 'chicken') // chỗ mới mở được dùng tiếp theo
  assert.equal(s.animals[ALL_FREE_SLOT_IDS[9]].kind, '') // chỗ chưa mở vẫn trống
})

test('save v11 -> v12: gà, vịt đang ở chuồng chuyển ra chỗ thả rông, heo bò ở lại; tặng tiền khởi đầu', () => {
  const s = fresh()
  const old = JSON.parse(G.serializeSave(s))
  old.version = 11
  old.money = 50
  old.animals.pen_0 = { kind: 'chicken', fed: true, prodMs: 100 }
  old.animals.pen_1 = { kind: 'cow', fed: false, prodMs: 0 }
  delete old.animals.free_0
  const back = G.parseSave(JSON.stringify(old), PLOTS)
  assert.notEqual(back, null)
  assert.equal(back!.animals.pen_0.kind, '')
  assert.deepEqual(back!.animals.free_0, { kind: 'chicken', fed: true, prodMs: 100 }) // giữ nguyên trạng thái
  assert.equal(back!.animals.pen_1.kind, 'cow')
  assert.equal(back!.money, 50 + START_MONEY)
})

test('save v12: gà trong chuồng hoặc bò ở bãi thả rông bị từ chối', () => {
  const good = JSON.parse(G.serializeSave(fresh()))
  const mut = (f: (d: any) => void) => {
    const d = structuredClone(good)
    f(d)
    return G.parseSave(JSON.stringify(d), PLOTS)
  }
  assert.notEqual(mut(() => {}), null)
  assert.equal(mut((d) => (d.animals.pen_0 = { kind: 'chicken', fed: false, prodMs: 0 })), null)
  assert.equal(mut((d) => (d.animals.free_0 = { kind: 'cow', fed: false, prodMs: 0 })), null)
})

test('tiền khởi đầu hào phóng', () => {
  assert.equal(G.newGame(PLOTS, { col: 1, row: 1 }).money, START_MONEY)
  assert.ok(START_MONEY >= 100_000)
  assert.equal(unlockMet({ ...NO_ZONE_LEVELS }, { zone: 'field', level: 1 }), false)
  assert.equal(unlockMet({ ...NO_ZONE_LEVELS, field: 1 }, { zone: 'field', level: 1 }), true)
})
