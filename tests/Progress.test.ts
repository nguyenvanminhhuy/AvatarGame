// Test cho nâng cấp, thời gian trong ngày, ánh sáng và lưu phiên bản 5.
import test from 'node:test'
import assert from 'node:assert/strict'
import * as G from '../src/state/GameState.ts'
import { CROPS } from '../src/data/items.ts'
import { DAY_MS, clockText, hourOf, lightAt } from '../src/state/clock.ts'
import { UPGRADES } from '../src/data/upgrades.ts'
import { ALL_PLOTS, ZONES, ZONE_IDS, plotsInArea } from '../src/data/world.ts'

const IDS = ['a', 'b']
const fresh = () => {
  const s = G.newGame(IDS, { col: 1, row: 1 })
  s.money = 0
  return s
}
const NEED = CROPS.seed_carrot.growMs

// ---------- Nâng cấp ----------
test('nâng cấp: kiểm tra tiền trước khi trừ, đúng giá từng cấp, có giới hạn cấp', () => {
  const s = fresh()
  const fert = UPGRADES.find((u) => u.id === 'fertilizer')!
  s.money = fert.costs[0] - 1
  assert.equal(G.buyUpgrade(s, 'fertilizer'), 'no-money')
  assert.equal(s.money, fert.costs[0] - 1)
  assert.equal(G.upgradeLevel(s, 'fertilizer'), 0)
  s.money = fert.costs[0] + fert.costs[1]
  assert.equal(G.buyUpgrade(s, 'fertilizer'), 'ok')
  assert.equal(G.buyUpgrade(s, 'fertilizer'), 'ok')
  assert.equal(s.money, 0)
  assert.equal(G.upgradeLevel(s, 'fertilizer'), 2)
  s.money = 99999
  assert.equal(G.buyUpgrade(s, 'fertilizer'), 'max-level')
  assert.equal(s.money, 99999) // không trừ tiền khi đã tối đa
  assert.equal(G.buyUpgrade(s, 'khong_co'), 'unknown')
})

test('phân bón làm cây lớn nhanh hơn, mỗi cấp +25%', () => {
  const grow = (level: number) => {
    const s = fresh()
    if (level > 0) s.upgrades.fertilizer = level
    G.addItem(s, 'seed_carrot', 1)
    G.plant(s, 'a')
    G.water(s, 'a')
    G.tick(s, 8000)
    return s.plots.a.growMs
  }
  assert.equal(grow(0), 8000)
  assert.equal(grow(1), 10000)
  assert.equal(grow(2), 12000)
})

test('bình tưới lớn: tưới nhiều ô một lần, bỏ qua ô không hợp lệ', () => {
  const s = fresh()
  G.addItem(s, 'seed_carrot', 3)
  for (const id of ['a', 'b']) G.plant(s, id)
  assert.equal(G.water(s, 'a', ['b', 'khong_co']), 'ok')
  assert.equal(s.plots.a.watered, true)
  assert.equal(s.plots.b.watered, true) // ô phụ cũng được tưới
  s.plots.c = { planted: false, crop: '', watered: false, growMs: 0 }
  s.plots.a.watered = false
  G.water(s, 'a', ['c']) // ô trống không bị tưới
  assert.equal(s.plots.c.watered, false)
})

test('vùng tưới theo cấp bình tưới: 1 ô, 3 ô cùng hàng, khối 3x3, bỏ ô chưa mở', () => {
  const farmPlots = ALL_PLOTS.filter((p) => /^plot_\d/.test(p.id))
  const center = farmPlots.find((p) => p.id === 'plot_1_1')!
  const ids = (lv: number, unlocked = true) => plotsInArea(farmPlots, center.id, lv, () => unlocked)
  assert.deepEqual(ids(0), [center.id])
  assert.equal(ids(1).length, 3)
  assert.ok(ids(1).every((id) => farmPlots.find((p) => p.id === id)!.row === center.row))
  assert.equal(ids(2).length, 9) // 3 cột x 3 hàng
  assert.deepEqual(ids(2, false), [center.id]) // không ô nào mở: chỉ còn ô chính
  const corner = farmPlots.find((p) => p.id === 'plot_0_0')!
  assert.equal(plotsInArea(farmPlots, corner.id, 2).length, 4) // góc: chỉ 4 ô
  assert.deepEqual(plotsInArea(farmPlots, 'khong_co', 2), [])
})

// ---------- Thời gian, ngủ, ánh sáng ----------
test('đồng hồ: 06:00 đầu ngày, 15 giây thật = 1 giờ game, 24:00 cuối ngày', () => {
  assert.equal(clockText(0), '06:00')
  assert.equal(clockText(15_000), '07:00')
  assert.equal(clockText(DAY_MS / 2), '15:00')
  assert.equal(clockText(DAY_MS - 1), '23:59')
  assert.equal(hourOf(DAY_MS), 24)
})

test('sang ngày mới khi hết ngày: tăng ngày, về đầu ngày', () => {
  const s = fresh()
  assert.equal(G.tickTime(s, DAY_MS - 1), false)
  assert.equal(s.day, 1)
  assert.equal(G.tickTime(s, 1), true)
  assert.equal(s.day, 2)
  assert.equal(s.time, 0)
  assert.equal(G.tickTime(s, -5), false)
  assert.equal(G.tickTime(s, NaN), false)
})

test('ngủ: chỉ từ 18:00, sang ngày mới đầu ngày', () => {
  const s = fresh()
  s.time = DAY_MS * 0.3 // khoảng 11:24
  assert.equal(G.sleep(s), 'too-early')
  assert.equal(s.day, 1)
  s.time = DAY_MS * 0.7 // khoảng 18:36
  assert.equal(G.sleep(s), 'ok')
  assert.equal(s.day, 2)
  assert.equal(s.time, 0)
})

test('ánh sáng: ban ngày không phủ, tối dần về đêm, rạng sáng hơi tối; alpha luôn trong [0,1]', () => {
  assert.equal(lightAt(12).alpha, 0)
  assert.ok(lightAt(6).alpha > 0.2 && lightAt(6).alpha < 0.4) // rạng sáng
  assert.ok(lightAt(7.5).alpha < 0.01)
  let prev = 0
  for (let h = 16.5; h <= 24; h += 0.25) {
    const a = lightAt(h).alpha
    assert.ok(a >= prev - 1e-9, `alpha giảm bất thường ở ${h}`) // chiều -> đêm: không giảm
    assert.ok(a >= 0 && a <= 1)
    prev = a
  }
  assert.ok(lightAt(23).alpha >= 0.5)
  for (let h = 6; h <= 24; h += 0.5) {
    const c = lightAt(h).color
    assert.ok(Number.isInteger(c) && c >= 0 && c <= 0xffffff)
  }
})

// ---------- Lưu ----------
test('save: ghi rồi đọc lại đủ ngày, giờ, nâng cấp', () => {
  const s = fresh()
  s.day = 4
  s.time = 12345
  s.upgrades = { fertilizer: 1 }
  const back = G.parseSave(G.serializeSave(s), IDS)
  assert.deepEqual(back, s)
})

test('save: bản cũ version 4 (chưa có ngày/giờ/nâng cấp) được đọc với giá trị mặc định', () => {
  const s = fresh()
  G.giveStarter(s)
  s.flags.done.push('first_order')
  const old = JSON.parse(G.serializeSave(s))
  old.version = 4
  for (const k of ['day', 'time', 'upgrades']) delete old[k]
  const back = G.parseSave(JSON.stringify(old), IDS)
  assert.notEqual(back, null)
  assert.equal(back!.day, 1)
  assert.equal(back!.time, 0)
  assert.deepEqual(back!.upgrades, {})
  assert.deepEqual(back!.flags.done, ['first_order']) // dữ liệu v4 giữ nguyên
})

test('save: version 5 với ngày/giờ/nâng cấp sai bị từ chối', () => {
  const good = JSON.parse(G.serializeSave(fresh()))
  const mut = (f: (d: any) => void) => {
    const d = structuredClone(good)
    f(d)
    return G.parseSave(JSON.stringify(d), IDS)
  }
  assert.notEqual(mut(() => {}), null)
  assert.equal(mut((d) => (d.day = 0)), null)
  assert.equal(mut((d) => (d.day = 1.5)), null)
  assert.equal(mut((d) => (d.time = -1)), null)
  assert.equal(mut((d) => (d.time = DAY_MS)), null)
  assert.equal(mut((d) => (d.time = 'x')), null)
  // save cũ còn trường energy / nâng cấp stamina: bỏ qua, vẫn đọc được
  assert.notEqual(mut((d) => ((d.energy = 999), (d.upgrades = { stamina: 1 }))), null)
  assert.notEqual(mut((d) => delete d.energy), null)
  assert.equal(mut((d) => (d.upgrades = { khong_co: 1 })), null)
  assert.equal(mut((d) => (d.upgrades = { fertilizer: 3 })), null) // quá cấp tối đa
  assert.equal(mut((d) => (d.upgrades = { fertilizer: 0 })), null)
  assert.equal(mut((d) => (d.upgrades = [])), null)
})

// ---------- Mở rộng các khu ----------
test('mở rộng khu: kiểm tra tiền trước khi trừ, đúng giá từng cấp, giới hạn cấp, mỗi khu riêng', () => {
  for (const zone of ZONE_IDS) {
    const s = fresh()
    const first = G.zoneCost(s, zone)!
    assert.equal(first, ZONES[zone].costs[0])
    s.money = first - 1
    assert.equal(G.buyZone(s, zone), 'no-money')
    assert.equal(s.money, first - 1)
    assert.equal(s.zones[zone], 0)
    s.money = 100000
    let spent = 0
    while (G.zoneCost(s, zone) !== null) {
      const c = G.zoneCost(s, zone)!
      assert.equal(G.buyZone(s, zone), 'ok')
      spent += c
    }
    assert.equal(100000 - s.money, spent)
    assert.equal(s.zones[zone], ZONES[zone].costs.length)
    const money = s.money
    assert.equal(G.buyZone(s, zone), 'max-level')
    assert.equal(s.money, money) // đã tối đa: không trừ tiền
    for (const other of ZONE_IDS.filter((z) => z !== zone)) assert.equal(s.zones[other], 0) // khu khác không đổi
  }
  assert.equal(G.buyZone(fresh(), 'khong_co' as never), 'unknown')
})

test('save: lưu/đọc cấp các khu; bản 7-8 đổi expansion thành khu trồng trọt; bản cũ về 0; giá trị sai bị từ chối', () => {
  const s = fresh()
  s.zones = { pen: 1, kitchen: 1, warehouse: 2, field: 2, pond: 2 }
  assert.deepEqual(G.parseSave(G.serializeSave(s), IDS), s)
  const base = JSON.parse(G.serializeSave(fresh()))
  const v8 = { ...base, version: 8, expansion: 2, kitchen: null }
  delete v8.zones
  assert.deepEqual(G.parseSave(JSON.stringify(v8), IDS)!.zones, { pen: 0, kitchen: 0, warehouse: 0, field: 36, pond: 0 }) // cấp cũ 2 = 2 lô thêm: bản 13 (15 ô/lô) rồi bản 15 (18 ô/lô) = 36 ô thêm
  const v6 = { ...base, version: 6 }
  delete v6.zones
  assert.deepEqual(G.parseSave(JSON.stringify(v6), IDS)!.zones, { pen: 0, kitchen: 0, warehouse: 0, field: 0, pond: 0 })
  const ok = { pen: 0, kitchen: 0, warehouse: 0, field: 0, pond: 0 }
  const mut = (z: unknown) => G.parseSave(JSON.stringify({ ...base, zones: z }), IDS)
  assert.notEqual(mut(ok), null)
  assert.equal(mut({ ...ok, pen: -1 }), null)
  assert.equal(mut({ ...ok, field: 99 }), null)
  assert.notEqual(mut({ ...ok, field: 63 }), null) // tối đa: 63 ô thêm (4 lô x 18 - 9 có sẵn)
  assert.equal(mut({ ...ok, field: 1.5 }), null)
  assert.equal(mut({ pen: 0, field: 0, pond: 0 }), null) // thiếu khu
  assert.equal(mut('x'), null)
})
