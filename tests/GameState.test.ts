import test from 'node:test'
import assert from 'node:assert/strict'
import * as G from '../src/state/GameState.ts'
import { START_MONEY } from '../src/data/items.ts'
import { CROPS, ITEMS } from '../src/data/items.ts'
import { QUESTS } from '../src/data/quests.ts'
import { RECIPES } from '../src/data/recipes.ts'
import { ANIMALS } from '../src/data/animals.ts'

const IDS = ['a', 'b']
const fresh = () => {
  const s = G.newGame(IDS, { col: 1, row: 1 })
  s.money = 0 // đa số test tính tiền từ 0; tiền khởi đầu thật là START_MONEY
  return s
}
const NEED = CROPS.seed_carrot.growMs

test('addItem/removeItem: không cho số lượng âm hoặc vật phẩm lạ', () => {
  const s = fresh()
  assert.equal(G.addItem(s, 'seed_carrot', 2), true)
  assert.equal(G.removeItem(s, 'seed_carrot', 3), false)
  assert.equal(G.count(s, 'seed_carrot'), 2)
  assert.equal(G.addItem(s, 'nope', 1), false)
  assert.equal(G.addItem(s, 'seed_carrot', -1), false)
  assert.equal(G.removeItem(s, 'seed_carrot', 2), true)
  assert.equal(G.count(s, 'seed_carrot'), 0)
})

test('buy: trừ tiền đúng, không đủ tiền thì không đổi gì', () => {
  const s = fresh()
  assert.equal(G.buy(s, 'seed_carrot'), 'no-money')
  assert.equal(G.count(s, 'seed_carrot'), 0)
  s.money = 25
  assert.equal(G.buy(s, 'seed_carrot'), 'ok')
  assert.equal(s.money, 15)
  assert.equal(G.buy(s, 'carrot'), 'not-for-sale')
})

test('sellAll: cộng tiền, xóa hàng, bán lần hai không có gì', () => {
  const s = fresh()
  G.addItem(s, 'carrot', 3)
  assert.equal(G.sellAll(s, 'carrot'), 75)
  assert.equal(s.money, 75)
  assert.equal(G.count(s, 'carrot'), 0)
  assert.equal(G.sellAll(s, 'carrot'), 0)
  assert.equal(G.sellAll(s, 'seed_carrot'), 0) // hạt không bán được
})

test('vòng chơi: trồng -> tưới -> lớn -> thu hoạch, không nhân đôi thưởng', () => {
  const s = fresh()
  assert.equal(G.plant(s, 'a'), 'no-seed')
  G.giveStarter(s)
  assert.equal(G.count(s, 'seed_carrot'), 3)
  assert.equal(G.plant(s, 'a'), 'ok')
  assert.equal(G.plant(s, 'a'), 'occupied')
  G.tick(s, NEED) // chưa tưới thì không lớn
  assert.equal(G.isReady(s.plots.a), false)
  assert.equal(G.water(s, 'a'), 'ok')
  assert.equal(G.water(s, 'a'), 'already-watered')
  G.tick(s, NEED / 2)
  assert.equal(G.harvest(s, 'a'), 'not-ready')
  G.tick(s, NEED)
  assert.equal(G.isReady(s.plots.a), true)
  assert.equal(G.harvest(s, 'a'), 'ok')
  assert.equal(G.harvest(s, 'a'), 'not-ready') // lặp lại không thưởng thêm
  assert.equal(G.count(s, 'carrot'), 1)
  assert.equal(G.water(s, 'a'), 'not-planted')
  assert.equal(G.plant(s, 'zzz'), 'unknown-plot')
})

test('giveStarter chỉ tặng một lần', () => {
  const s = fresh()
  assert.equal(G.giveStarter(s), true)
  assert.equal(G.giveStarter(s), false)
  assert.equal(G.count(s, 'seed_carrot'), 3)
})

test('tick bỏ qua dt không hợp lệ', () => {
  const s = fresh()
  G.giveStarter(s)
  G.plant(s, 'a')
  G.water(s, 'a')
  G.tick(s, -100)
  G.tick(s, NaN)
  assert.equal(s.plots.a.growMs, 0)
})

test('save: ghi rồi đọc lại giống hệt', () => {
  const s = fresh()
  G.giveStarter(s)
  G.plant(s, 'a')
  G.water(s, 'a')
  G.tick(s, 5000)
  s.money = 42
  s.player = { col: 3.5, row: 2 }
  const back = G.parseSave(G.serializeSave(s), IDS)
  assert.deepEqual(back, s)
})

test('save: dữ liệu hỏng/thiếu/sai phiên bản trả về null, không ném lỗi', () => {
  const good = JSON.parse(G.serializeSave(fresh()))
  const bad = (mut: (d: Record<string, unknown>) => void) => {
    const d = structuredClone(good)
    mut(d)
    return G.parseSave(JSON.stringify(d), IDS)
  }
  assert.equal(G.parseSave('not json', IDS), null)
  assert.equal(G.parseSave('null', IDS), null)
  assert.equal(bad((d) => (d.version = 999)), null)
  assert.equal(bad((d) => (d.money = -5)), null)
  assert.equal(bad((d) => (d.money = 1.5)), null)
  assert.equal(bad((d) => (d.inventory = { carrot: -1 })), null)
  assert.equal(bad((d) => (d.inventory = { ghost: 1 })), null)
  assert.equal(bad((d) => ((d.plots as Record<string, unknown>).a = 'không phải ô đất')), null)
  assert.equal(bad((d) => ((d.plots as Record<string, { growMs: unknown }>).a.growMs = 'x')), null)
  assert.equal(bad((d) => delete d.flags), null)
  assert.equal(bad((d) => (d.player = { col: 'x', row: 1 })), null)
})

test('save: bản cũ version 1 (không có map) được đọc và chuyển về bản đồ đầu', () => {
  const s = fresh()
  G.giveStarter(s)
  s.money = 7
  const old = JSON.parse(G.serializeSave(s))
  old.version = 1
  delete old.map
  const back = G.parseSave(JSON.stringify(old), IDS)
  assert.notEqual(back, null)
  assert.equal(back!.map, 'farm')
  assert.equal(back!.money, 7 + START_MONEY) // save cũ được tặng thêm tiền khởi đầu (bản 12)
  assert.equal(G.count(back!, 'seed_carrot'), 3)
})

test('save: version 2 với map lạ hoặc thiếu map bị từ chối', () => {
  const good = JSON.parse(G.serializeSave(fresh()))
  const withMap = (m: unknown) => {
    const d = structuredClone(good)
    d.map = m
    return G.parseSave(JSON.stringify(d), IDS)
  }
  assert.equal(withMap('hub')?.map, 'hub')
  assert.equal(withMap('house'), null) // bản đồ trong nhà đã bỏ (chỉ bản cũ mới được đổi sang khu chợ)
  assert.equal(withMap('narnia'), null)
  assert.equal(withMap(undefined), null)
  assert.equal(withMap(5), null)
})

const TOMATO_NEED = CROPS.seed_tomato.growMs

test('cà chua: trồng bằng hạt cà chua, lớn chậm hơn cà rốt, thu hoạch ra cà chua', () => {
  const s = fresh()
  G.addItem(s, 'seed_tomato', 1)
  G.addItem(s, 'seed_carrot', 1)
  assert.equal(G.plant(s, 'a', 'seed_tomato'), 'ok')
  assert.equal(G.plant(s, 'b', 'seed_carrot'), 'ok')
  assert.equal(s.plots.a.crop, 'seed_tomato')
  G.water(s, 'a')
  G.water(s, 'b')
  G.tick(s, NEED) // đủ cho cà rốt, chưa đủ cho cà chua
  assert.equal(G.isReady(s.plots.b), true)
  assert.equal(G.isReady(s.plots.a), false)
  assert.ok(G.growProgress(s.plots.a) > 0 && G.growProgress(s.plots.a) < 1)
  G.tick(s, TOMATO_NEED)
  assert.equal(G.isReady(s.plots.a), true)
  assert.equal(G.harvest(s, 'a'), 'ok')
  assert.equal(G.harvest(s, 'b'), 'ok')
  assert.equal(G.count(s, 'tomato'), 1)
  assert.equal(G.count(s, 'carrot'), 1)
  assert.equal(s.plots.a.crop, '')
  assert.equal(G.harvest(s, 'a'), 'not-ready') // không nhân đôi
})

test('plant: hạt lạ bị từ chối và không trừ vật phẩm; thiếu đúng loại hạt thì báo no-seed', () => {
  const s = fresh()
  G.addItem(s, 'seed_carrot', 1)
  assert.equal(G.plant(s, 'a', 'carrot'), 'unknown-seed') // nông sản không phải hạt
  assert.equal(G.plant(s, 'a', 'seed_tomato'), 'no-seed') // có hạt cà rốt nhưng không có hạt cà chua
  assert.equal(G.count(s, 'seed_carrot'), 1)
  assert.equal(s.plots.a.planted, false)
})

test('sellAllProduce: bán mọi nông sản, giữ lại hạt giống', () => {
  const s = fresh()
  G.addItem(s, 'carrot', 2)
  G.addItem(s, 'tomato', 1)
  G.addItem(s, 'seed_tomato', 3)
  assert.equal(G.sellAllProduce(s), 2 * 25 + 70)
  assert.equal(s.money, 120)
  assert.equal(G.count(s, 'seed_tomato'), 3)
  assert.equal(G.sellAllProduce(s), 0)
})

test('mua hạt cà chua: đúng giá, không đủ tiền thì không đổi gì (sau khi mở khóa)', () => {
  const s = fresh()
  s.zones.field = 1 // hạt cà chua chỉ bán sau khi mở rộng ruộng lên cấp 1
  s.money = 24
  assert.equal(G.buy(s, 'seed_tomato'), 'no-money')
  assert.equal(s.money, 24)
  s.money = 30
  assert.equal(G.buy(s, 'seed_tomato'), 'ok')
  assert.equal(s.money, 5)
})

test('save: bản cũ version 2 (ô đất chưa có crop) được chuyển: ô đang trồng thành cà rốt', () => {
  const s = fresh()
  G.giveStarter(s)
  G.plant(s, 'a')
  G.water(s, 'a')
  const old = JSON.parse(G.serializeSave(s))
  old.version = 2
  for (const p of Object.values(old.plots) as Array<Record<string, unknown>>) delete p.crop
  const back = G.parseSave(JSON.stringify(old), IDS)
  assert.notEqual(back, null)
  assert.equal(back!.plots.a.crop, 'seed_carrot')
  assert.equal(back!.plots.b.crop, '')
  assert.equal(back!.plots.a.planted, true)
})

test('save: version 3 với crop sai bị từ chối', () => {
  const s = fresh()
  G.addItem(s, 'seed_tomato', 1)
  G.plant(s, 'a', 'seed_tomato')
  const good = JSON.parse(G.serializeSave(s))
  assert.deepEqual(G.parseSave(JSON.stringify(good), IDS)?.plots.a.crop, 'seed_tomato')
  const mut = (f: (d: any) => void) => {
    const d = structuredClone(good)
    f(d)
    return G.parseSave(JSON.stringify(d), IDS)
  }
  assert.equal(mut((d) => (d.plots.a.crop = 'seed_ghost')), null) // loại cây lạ
  assert.equal(mut((d) => (d.plots.a.crop = '')), null) // đang trồng mà không có loại
  assert.equal(mut((d) => (d.plots.b.crop = 'seed_carrot')), null) // ô trống mà có loại
  assert.equal(mut((d) => delete d.plots.a.crop), null) // v3 phải có crop
})

test('hạt cà chua bị khóa đến khi mở rộng khu trồng trọt lên cấp 1', () => {
  const s = fresh()
  s.money = 1000
  assert.equal(G.isBuyable(s, 'seed_tomato'), false)
  assert.equal(G.isBuyable(s, 'seed_carrot'), true)
  assert.equal(G.buy(s, 'seed_tomato'), 'locked')
  assert.equal(s.money, 1000) // không mất tiền khi bị khóa
  assert.equal(G.count(s, 'seed_tomato'), 0)
  assert.equal(G.buyZone(s, 'field'), 'ok')
  assert.equal(G.isBuyable(s, 'seed_tomato'), true)
  assert.equal(G.buy(s, 'seed_tomato'), 'ok')
})

test('đơn hàng: chuỗi theo thứ tự, chỉ giao khi đủ hàng, thưởng một lần', () => {
  const s = fresh()
  assert.equal(G.currentQuest(s)?.id, 'first_order')
  assert.equal(G.deliver(s), 'not-enough')
  G.addItem(s, 'carrot', 2)
  assert.equal(G.deliver(s), 'not-enough')
  assert.equal(G.count(s, 'carrot'), 2) // thiếu hàng thì không trừ gì
  assert.equal(s.money, 0)
  G.addItem(s, 'carrot', 2) // có 4, cần 3
  assert.equal(G.deliver(s), 'ok')
  assert.equal(G.count(s, 'carrot'), 1) // chỉ trừ đúng số cần
  assert.equal(s.money, 90)
  assert.deepEqual(s.flags.done, ['first_order'])
  assert.equal(G.currentQuest(s)?.id, 'tomato_party') // sang đơn kế tiếp
  assert.equal(G.deliver(s), 'not-enough') // cà rốt thừa không dùng được cho đơn cà chua
  assert.equal(s.money, 90) // không nhận thưởng lần hai
})

test('ba đơn đầu có nhiều loại hàng; cả chuỗi hoàn thành theo thứ tự và thưởng đúng', () => {
  const s = fresh()
  G.addItem(s, 'carrot', 3 + 6)
  G.addItem(s, 'tomato', 2 + 3)
  assert.equal(G.deliver(s), 'ok') // first_order
  assert.equal(G.deliver(s), 'ok') // tomato_party
  const q = G.currentQuest(s)!
  assert.equal(q.id, 'big_garden')
  assert.deepEqual(
    G.questProgress(s, q).map((p) => [p.id, p.have, p.need]).sort(),
    [['carrot', 6, 6], ['tomato', 3, 3]].sort(),
  )
  assert.equal(G.deliver(s), 'ok')
  assert.equal(s.money, 90 + 220 + 500)
  // các đơn còn lại: cấp đủ hàng rồi giao lần lượt
  let total = s.money
  for (const quest of QUESTS.slice(3)) {
    assert.equal(G.currentQuest(s)?.id, quest.id)
    assert.equal(G.deliver(s), 'not-enough', quest.id)
    s.inventory = {}
    for (const [id, n] of Object.entries(quest.require)) G.addItem(s, id, n)
    s.money = 0
    assert.equal(G.deliver(s), 'ok', quest.id)
    assert.equal(s.money, quest.rewardMoney)
    total += quest.rewardMoney
  }
  assert.equal(G.currentQuest(s), null)
  assert.equal(G.deliver(s), 'no-quest')
  assert.ok(total > 20_000)
})

test('chuỗi đơn dài (>= 15 đơn), ID duy nhất, hàng yêu cầu làm ra được (cây trồng, vật nuôi hoặc món nấu)', () => {
  assert.ok(QUESTS.length >= 15)
  assert.equal(new Set(QUESTS.map((q) => q.id)).size, QUESTS.length)
  const cooked = new Set(RECIPES.map((r) => r.output))
  const harvested = new Set(Object.values(CROPS).map((c) => c.harvestItem))
  const produced = new Set(Object.values(ANIMALS).map((a) => a.product))
  for (const q of QUESTS) {
    assert.ok(q.rewardMoney > 0, q.id)
    for (const [id, n] of Object.entries(q.require)) {
      assert.ok(id in ITEMS && n > 0, `${q.id}: hàng lạ ${id}`)
      assert.ok(cooked.has(id) || harvested.has(id) || produced.has(id), `${q.id}: ${id} không làm ra được`)
    }
  }
})

test('mọi cây trồng: hạt có giá mua, nông sản có giá bán, ảnh đủ giai đoạn, mở khóa theo cấp ruộng tăng dần', () => {
  let lastLevel = 0
  for (const [seed, crop] of Object.entries(CROPS)) {
    assert.ok(ITEMS[seed].buyPrice! > 0, seed)
    assert.ok(ITEMS[crop.harvestItem].sellPrice! > ITEMS[seed].buyPrice!, `${seed}: bán phải lời hơn giá hạt`)
    for (const art of [crop.seedArt, crop.sproutArt, crop.growArt, crop.readyArt]) assert.ok(art.startsWith('plant-'), art)
    const lv = ITEMS[seed].unlock?.level ?? 0
    assert.ok(lv >= lastLevel, `${seed}: cấp mở khóa phải tăng dần theo thứ tự khai báo`)
    lastLevel = lv
  }
  assert.ok(Object.keys(CROPS).length >= 8)
})

test('mọi công thức: nguyên liệu và thành phẩm có trong catalog, thành phẩm bán cao hơn tổng nguyên liệu', () => {
  for (const r of RECIPES) {
    const cost = Object.entries(r.inputs).reduce((sum, [id, n]) => sum + (ITEMS[id].sellPrice ?? 0) * n, 0)
    assert.ok(ITEMS[r.output].sellPrice! * r.yield > cost, `${r.id}: thành phẩm phải lời hơn nguyên liệu (${ITEMS[r.output].sellPrice} vs ${cost})`)
  }
  assert.ok(RECIPES.length >= 18)
})

test('save: lưu và đọc lại trạng thái đơn hàng đã xong', () => {
  const s = fresh()
  G.addItem(s, 'carrot', 3)
  G.deliver(s)
  const back = G.parseSave(G.serializeSave(s), IDS)
  assert.deepEqual(back?.flags.done, ['first_order'])
  assert.equal(back?.money, 90)
})

test('save: bản cũ version 3 (chưa có đơn hàng) được đọc với done rỗng', () => {
  const s = fresh()
  G.giveStarter(s)
  const old = JSON.parse(G.serializeSave(s))
  old.version = 3
  delete old.flags.done
  const back = G.parseSave(JSON.stringify(old), IDS)
  assert.deepEqual(back?.flags.done, [])
  assert.equal(G.count(back!, 'seed_carrot'), 3)
})

test('save: version 4 với danh sách đơn hàng sai bị từ chối', () => {
  const good = JSON.parse(G.serializeSave(fresh()))
  const mut = (f: (d: any) => void) => {
    const d = structuredClone(good)
    f(d)
    return G.parseSave(JSON.stringify(d), IDS)
  }
  assert.notEqual(mut((d) => (d.flags.done = ['first_order'])), null)
  assert.equal(mut((d) => (d.flags.done = ['khong_co'])), null)
  assert.equal(mut((d) => (d.flags.done = ['first_order', 'first_order'])), null)
  assert.equal(mut((d) => (d.flags.done = 'first_order')), null)
  assert.equal(mut((d) => delete d.flags.done), null)
})

test('save: ô đất mới thêm sau khi lưu được tạo trống, không làm hỏng save cũ', () => {
  const s = fresh()
  G.giveStarter(s)
  G.plant(s, 'a')
  const old = JSON.parse(G.serializeSave(s))
  delete old.plots.b // mô phỏng save từ trước khi ô 'b' tồn tại
  const back = G.parseSave(JSON.stringify(old), IDS)
  assert.notEqual(back, null)
  assert.equal(back!.plots.a.planted, true) // giữ nguyên ô cũ
  assert.deepEqual(back!.plots.b, { planted: false, crop: '', watered: false, growMs: 0 })
})
