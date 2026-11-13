// Kiểm tra dữ liệu bản đồ: nông trại cố định 54x17 (cuộn ngang), khu chợ, các khu mở rộng được, vật chặn không đè lên đối tượng.
import test from 'node:test'
import assert from 'node:assert/strict'
import { freeCols,
  ALL_ANIMAL_SLOT_IDS,
  ALL_PLOT_IDS,
  MAPS,
  START_MAP,
  TILE,
  ZONES,
  ZONE_IDS,
  buildingSpot,
  farmLayout,
  getMap,
  pondCapacity,
  pondDims,
  zoneCols,
  type MapDef,
  type ZoneLevels,
} from '../src/data/world.ts'

const key = (c: number, r: number) => `${c},${r}`
const MAX_LEVELS = Object.fromEntries(ZONE_IDS.map((z) => [z, ZONES[z].costs.length])) as ZoneLevels
const L = (o: Partial<ZoneLevels>): ZoneLevels => ({ pen: 0, kitchen: 0, warehouse: 0, field: 0, pond: 0, ...o })
const LEVEL_SETS: Array<[string, ZoneLevels]> = [
  ['cấp 0', L({})],
  ['chuồng 1', L({ pen: 1 })],
  ['ruộng 2', L({ field: 2 })],
  ['ao 2', L({ pond: 2 })],
  ['bếp+kho', L({ kitchen: 2, warehouse: 3 })],
  ['hỗn hợp', L({ pen: 2, field: 1, pond: 1, kitchen: 1, warehouse: 1 })],
  ['tối đa', MAX_LEVELS],
]
const ALL_MAPS: Array<[string, MapDef]> = [...LEVEL_SETS.map(([n, lv]): [string, MapDef] => [`nông trại ${n}`, farmLayout(lv)]), ['khu chợ', MAPS.hub]]

// Toàn bộ ô bị chặn của bản đồ: ô chặn riêng, công trình, vật thể, NPC.
function blockedSet(m: MapDef) {
  const set = new Set<string>()
  for (const [c, r] of m.blocked) set.add(key(c, r))
  for (const b of m.buildings) for (let r = b.row; r < b.row + b.h; r++) for (let c = b.col; c < b.col + b.w; c++) set.add(key(c, r))
  for (const p of m.props) for (let r = p.row; r < p.row + p.h; r++) for (let c = p.col; c < p.col + p.w; c++) set.add(key(c, r))
  if (m.npc) set.add(key(m.npc.col, m.npc.row))
  return set
}

test('kích thước cố định: nông trại 54x17 ô (cuộn ngang, cao đúng một màn hình), khu chợ vừa một màn hình', () => {
  for (const [name, lv] of LEVEL_SETS) {
    const m = farmLayout(lv)
    assert.equal(m.cols, 54, name)
    assert.equal(m.rows, 17, name)
    assert.ok(m.rows * TILE <= 544, `${name}: cao quá màn hình`)
    assert.ok(m.cols * TILE > 960, `${name}: chưa rộng hơn màn hình`)
  }
  assert.ok(MAPS.hub.cols * TILE <= 960 && MAPS.hub.rows * TILE <= 544)
  assert.equal(START_MAP, 'hub')
})

test('thứ tự các khu từ trái sang phải: chuồng, nhà bếp, nhà kho, ruộng, hồ cá', () => {
  for (const [name, lv] of LEVEL_SETS) {
    const m = farmLayout(lv)
    const kitchen = m.buildings.find((b) => b.id === 'kitchen')!
    const warehouse = m.buildings.find((b) => b.id === 'warehouse')!
    const penMax = Math.max(...m.animalSlots.filter((s) => !s.free && !s.pond).map((s) => s.col))
    const fieldCols = m.plots.map((p) => p.col)
    const pondMin = Math.min(...m.animalSlots.filter((s) => s.pond).map((s) => s.col))
    assert.ok(penMax < kitchen.col, `${name}: chuồng bên trái nhà bếp`)
    assert.ok(kitchen.col + kitchen.w <= warehouse.col, `${name}: nhà bếp bên trái nhà kho`)
    assert.ok(warehouse.col + warehouse.w <= Math.min(...fieldCols), `${name}: nhà kho bên trái ruộng`)
    assert.ok(Math.max(...fieldCols) < pondMin, `${name}: ruộng bên trái hồ cá`)
  }
})

test('số ô theo cấp: chuồng 2 hàng, ruộng 3 hàng, ao 3 ô mỗi hàng; ID ổn định và nằm trong danh sách đầy đủ', () => {
  for (const [name, lv] of LEVEL_SETS) {
    const m = farmLayout(lv)
    assert.equal(m.animalSlots.filter((s) => !s.free && !s.pond).length, zoneCols('pen', lv.pen) * 2, `${name}: chỗ trong chuồng`)
    assert.equal(m.animalSlots.filter((s) => s.free).length, freeCols(lv.pen), `${name}: chỗ thả rông`)
    assert.equal(m.plots.length, zoneCols('field', lv.field), `${name}: ô ruộng (9 + 1 ô mỗi cấp)`)
    assert.equal(m.animalSlots.filter((s) => s.pond).length, pondCapacity(lv.pond), `${name}: chỗ cá trong hồ`)
    for (const p of m.plots) assert.ok(ALL_PLOT_IDS.includes(p.id), `${name}: ID lạ ${p.id}`)
    for (const s of m.animalSlots) assert.ok(ALL_ANIMAL_SLOT_IDS.includes(s.id), `${name}: ID lạ ${s.id}`)
    assert.equal(new Set(m.plots.map((p) => p.id)).size, m.plots.length)
  }
  // Mỗi cấp mở đúng 1 ô: 9 ô đầu là cột 0-2 của lô đầu; ô thứ 10 là cột 3 hàng 0; hết 18 ô (6 cột x 3 hàng) thì sang lô thứ hai.
  const ids = (f: number) => farmLayout(L({ field: f })).plots.map((p) => p.id)
  assert.ok(ids(0).includes('plot_0_0') && ids(0).includes('plot_2_2') && !ids(0).includes('plot_3_0'))
  assert.ok(ids(1).includes('plot_3_0') && !ids(1).includes('plot_3_1'))
  assert.ok(ids(9).includes('plot_5_2') && !ids(9).includes('plot_e1_0_0')) // ô thứ 18 của lô đầu
  assert.equal(ids(9).length, 18)
  assert.ok(ids(10).includes('plot_e1_0_0'))
  // Biển mua nằm đúng ô sắp mở, và ô đó chưa phải ô đất
  const m1 = farmLayout(L({ field: 1 }))
  const sign = m1.signs.find((s) => s.zone === 'field')!
  assert.ok(!m1.plots.some((p) => p.col === sign.col && p.row === sign.row))
  assert.equal(farmLayout(L({ field: 63 })).signs.some((s) => s.zone === 'field'), false)
})

test('hồ cá lớn dần theo cấp: mặt nước, sân và hàng rào đều to ra, cá nằm trong mặt nước, mặt nước nằm trong sân', () => {
  let prevArea = 0
  for (const lv of [0, 1, 2]) {
    const m = farmLayout(L({ pond: lv }))
    const p = m.pond!
    const y = m.pondYard!
    const { cols, rows } = pondDims(lv)
    assert.deepEqual([p.w, p.h], [cols, rows])
    assert.ok(p.w * p.h > prevArea, 'hồ phải to ra mỗi cấp')
    prevArea = p.w * p.h
    // bờ rộng đúng 1 ô mỗi phía rồi tới hàng rào (nước không đè lên hàng rào)
    assert.equal(p.col - y.col, 2)
    assert.equal(y.col + y.w - (p.col + p.w), 2)
    assert.equal(p.row - y.row, 2)
    assert.equal(y.row + y.h - (p.row + p.h), 2)
    for (const s of m.animalSlots.filter((x) => x.pond)) assert.ok(s.col >= p.col && s.col < p.col + p.w && s.row >= p.row && s.row < p.row + p.h, `cá ${s.id} ngoài mặt nước`)
    assert.ok(y.col + y.w <= m.cols - 1, 'sân hồ không đè lên dải lúa bên phải')
  }
})

test('nơi rải thức ăn: máng chuồng theo cỡ chuồng, bãi cỏ, mặt hồ; mỗi nơi ở đều có', () => {
  for (const [name, lv] of LEVEL_SETS) {
    const m = farmLayout(lv)
    const homes = (m.feeders ?? []).map((f) => f.home)
    for (const h of ['pen', 'free', 'pond']) assert.ok(homes.includes(h as 'pen'), `${name}: thiếu nơi rải thức ăn ${h}`)
    const trough = m.feeders!.find((f) => f.home === 'pen')!
    assert.equal(m.feeders!.filter((f) => f.home === 'pen').length, 1, `${name}: chỉ một máng`)
    assert.equal(trough.col, m.penGate![1] + 1, `${name}: máng ngay bên phải cổng chuồng`)
    assert.equal(trough.row, m.pen!.row + m.pen!.h - 2, `${name}: máng ở hàng trong cùng, sát cổng`)
    assert.equal(trough.w, Math.min(2, zoneCols('pen', lv.pen) - 1), `${name}: cỡ máng`)
    assert.ok(trough.col >= m.pen!.col + 1 && trough.col + trough.w <= m.pen!.col + m.pen!.w - 1, `${name}: máng nằm trong chuồng`)
  }
})

test('chỉ còn một cột lúa chín bên phải: ô x = cols-1 chặn, cols-2 đi được', () => {
  const m = farmLayout()
  const blocked = blockedSet(m)
  assert.ok(blocked.has(key(m.cols - 1, 10)))
  assert.ok(!blocked.has(key(m.cols - 2, 10)) || m.pondYard!.col + m.pondYard!.w - 1 >= m.cols - 2)
})

test('mọi vật trong bản đồ nằm trong biên, ở mọi cấp mở rộng', () => {
  for (const [name, m] of ALL_MAPS) {
    const inside = (c: number, r: number, w = 1, h = 1) => c >= 0 && r >= 0 && c + w <= m.cols && r + h <= m.rows
    for (const [c, r] of m.blocked) assert.ok(inside(c, r), `${name}: ô chặn (${c},${r}) ngoài biên`)
    for (const p of m.plots) assert.ok(inside(p.col, p.row), `${name}: ô đất ${p.id} ngoài biên`)
    for (const s of m.animalSlots) assert.ok(inside(s.col, s.row), `${name}: chỗ ${s.id} ngoài biên`)
    for (const b of m.buildings) assert.ok(inside(b.col, b.row, b.w, b.h + 1), `${name}: ${b.id} ngoài biên`)
    for (const p of m.props) assert.ok(inside(p.col, p.row, p.w, p.h + 1), `${name}: vật thể ${p.id} ngoài biên`)
    for (const d of m.doors) assert.ok(inside(d.col, d.row), `${name}: cửa ngoài biên`)
    for (const l of m.lots) assert.ok(inside(l.col, l.row, l.w, l.h), `${name}: lô cỏ ngoài biên`)
    if (m.pond) assert.ok(inside(m.pond.col, m.pond.row, m.pond.w, m.pond.h), `${name}: hồ ngoài biên`)
  }
})

test('vật chặn không đè lên ô đất, cửa, chỗ vật nuôi, chỗ đứng công trình/vật thể, NPC hay điểm xuất phát', () => {
  for (const [name, m] of ALL_MAPS) {
    const blocked = blockedSet(m)
    const mustBeFree: Array<[string, number, number]> = [
      ...m.plots.map((p): [string, number, number] => [`ô đất ${p.id}`, p.col, p.row]),
      ...m.doors.map((d): [string, number, number] => [`cửa tới ${d.to}`, d.col, d.row]),
      ...m.animalSlots.filter((s) => !s.pond).map((s): [string, number, number] => [`chỗ ${s.id}`, s.col, s.row]), // cá ở trong nước (chặn đường)
      ...m.buildings.map((b): [string, number, number] => [`chỗ đứng ${b.id}`, buildingSpot(b).col, buildingSpot(b).row]),
      ...m.props.filter((p) => p.action).map((p): [string, number, number] => [`chỗ đứng ${p.id}`, buildingSpot(p).col, buildingSpot(p).row]),
      ['điểm xuất phát', Math.floor(m.start.col), Math.floor(m.start.row)],
    ]
    for (const d of m.doors) {
      const target = d.to === 'farm' ? farmLayout() : MAPS[d.to]
      assert.ok(target, `${name}: cửa tới bản đồ lạ ${d.to}`)
      assert.ok(!blockedSet(target).has(key(Math.floor(d.spawn.col), Math.floor(d.spawn.row))), `vị trí xuất hiện sau cửa ${m.id} -> ${d.to} bị chặn`)
    }
    for (const [what, c, r] of mustBeFree) assert.ok(!blocked.has(key(c, r)), `${name}: ${what} (${c},${r}) bị vật chặn đè lên`)
  }
})

test('ID chỗ nuôi và ô đất không trùng; không có hai ô đất cùng vị trí', () => {
  assert.equal(new Set(ALL_ANIMAL_SLOT_IDS).size, ALL_ANIMAL_SLOT_IDS.length)
  assert.equal(new Set(ALL_PLOT_IDS).size, ALL_PLOT_IDS.length)
  const farm = farmLayout(MAX_LEVELS)
  assert.equal(new Set(farm.plots.map((p) => key(p.col, p.row))).size, farm.plots.length)
  assert.equal(getMap('farm', MAX_LEVELS).cols, farm.cols)
  assert.equal(getMap('hub').id, 'hub')
})

test('mỗi khu mở rộng được có biển MUA đứng được bên phải; hết cấp thì biển biến mất', () => {
  for (const [name, lv] of LEVEL_SETS) {
    const m = farmLayout(lv)
    const expected = ZONE_IDS.filter((z) => lv[z] < ZONES[z].costs.length)
    assert.deepEqual(m.signs.map((s) => s.zone).sort(), [...expected].sort(), `${name}: biển MUA`)
    const blocked = blockedSet(m)
    for (const s of m.signs) {
      assert.ok(blocked.has(key(s.col, s.row)), `${name}: biển ${s.zone} phải chặn ô của nó`)
      assert.ok(!blocked.has(key(s.col + 1, s.row)), `${name}: ô đứng mua của biển ${s.zone} bị chặn`)
    }
  }
})

test('hai bản đồ nối với nhau: cổng FARM ở khu chợ dẫn vào nông trại, lối ở tường dưới dẫn về khu chợ', () => {
  assert.ok(MAPS.hub.doors.length > 0 && MAPS.hub.doors.every((d) => d.to === 'farm'))
  assert.ok(MAPS.farm.doors.length > 0 && MAPS.farm.doors.every((d) => d.to === 'hub'))
  assert.ok(MAPS.hub.npc, 'khu chợ có lái buôn')
  assert.ok(MAPS.hub.props.some((p) => p.action === 'shop') && MAPS.hub.props.some((p) => p.action === 'quests'))
})

// Các tuyến đường chính phải thông suốt ở MỌI cấp mở rộng: BFS trên lưới ô.
test('đường đi thông suốt từ điểm xuất phát tới ô đất, ao, cửa, chuồng, công trình, vật thể, biển MUA, NPC', () => {
  for (const [name, m] of ALL_MAPS) {
    const blocked = blockedSet(m)
    const start: [number, number] = [Math.floor(m.start.col), Math.floor(m.start.row)]
    const seen = new Set<string>([key(...start)])
    const queue: Array<[number, number]> = [start]
    while (queue.length) {
      const [c, r] = queue.shift()!
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nc = c + dc
        const nr = r + dr
        if (nc < 0 || nr < 0 || nc >= m.cols || nr >= m.rows || blocked.has(key(nc, nr)) || seen.has(key(nc, nr))) continue
        seen.add(key(nc, nr))
        queue.push([nc, nr])
      }
    }
    const reach = (c: number, r: number) => seen.has(key(c, r))
    const near = (c: number, r: number) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dc, dr]) => reach(c + dc, r + dr))
    if (m.npc) assert.ok(near(m.npc.col, m.npc.row), `${name}: không tới được cạnh NPC`)
    for (const p of m.plots) assert.ok(reach(p.col, p.row), `${name}: không tới được ô ${p.id}`)
    for (const d of m.doors) assert.ok(reach(d.col, d.row), `${name}: không tới được cửa`)
    for (const b of m.buildings) assert.ok(reach(buildingSpot(b).col, buildingSpot(b).row), `${name}: không tới được ${b.id}`)
    for (const p of m.props.filter((x) => x.action)) assert.ok(reach(buildingSpot(p).col, buildingSpot(p).row), `${name}: không tới được ${p.id}`)
    for (const s of m.animalSlots) {
      if (s.pond) {
        // Chỗ cá nằm trong nước (chặn đường): phải có ô bờ đi tới được trong tầm vớt cá (3 ô quanh chỗ cá).
        let ok = false
        for (let c = s.col - 3; c <= s.col + 3; c++) for (let r = s.row - 3; r <= s.row + 3; r++) if (Math.hypot(c - s.col, r - s.row) <= 3 && reach(c, r)) ok = true
        assert.ok(ok, `${name}: không với tới được cá ${s.id} từ bờ`)
        assert.ok(blocked.has(key(s.col, s.row)), `${name}: chỗ cá ${s.id} phải là mặt nước chặn đường`)
      } else assert.ok(reach(s.col, s.row), `${name}: không tới được chỗ ${s.id}`)
    }
    // Mọi nơi rải thức ăn phải đứng gần được (cạnh máng, trong bãi cỏ, trên bờ hồ)
    for (const f of m.feeders ?? []) {
      let ok = false
      for (let c = f.col - 1; c <= f.col + f.w; c++) for (let r = f.row - 1; r <= f.row + f.h; r++) if (reach(c, r)) ok = true
      assert.ok(ok, `${name}: không tới được nơi rải thức ăn ${f.home}`)
    }
    for (const s of m.signs) assert.ok(reach(s.col + 1, s.row), `${name}: không đứng được cạnh biển ${s.zone}`)
  }
})
