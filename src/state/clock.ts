// Đồng hồ ngày/đêm của game (logic thuần). Một ngày game chạy từ 06:00 đến 24:00,
// chỉ trôi khi game đang mở (giống cây trồng, không trôi khi offline).

export const DAY_MS = 270_000 // 4,5 phút thật = 18 giờ game, nên 1 giờ game = 15 giây thật
export const START_HOUR = 6
export const END_HOUR = 24
export const SLEEP_HOUR = 18 // từ giờ này giường mới cho ngủ

export const hourOf = (timeMs: number): number => START_HOUR + ((END_HOUR - START_HOUR) * timeMs) / DAY_MS

export function clockText(timeMs: number): string {
  const h = hourOf(timeMs)
  const hh = Math.floor(h)
  const mm = Math.floor((h - hh) * 60)
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

export interface Light {
  color: number // màu phủ lên màn hình
  alpha: number // 0 = ban ngày sáng hẳn
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
function lerpColor(a: number, b: number, t: number): number {
  const ch = (c: number, s: number) => (c >> s) & 0xff
  const mix = (s: number) => Math.round(lerp(ch(a, s), ch(b, s), t))
  return (mix(16) << 16) | (mix(8) << 8) | mix(0)
}

const DAWN = 0x1a2a50
const DUSK = 0xff8c42
const NIGHT = 0x0a1230

// Ánh sáng theo giờ: rạng sáng hơi tối xanh, ban ngày sáng, chiều ấm cam, tối đậm dần.
export function lightAt(hour: number): Light {
  if (hour < 7.5) return { color: DAWN, alpha: lerp(0.3, 0, Math.max(0, (hour - START_HOUR) / (7.5 - START_HOUR))) }
  if (hour < 16.5) return { color: DUSK, alpha: 0 }
  if (hour < 19) return { color: DUSK, alpha: lerp(0, 0.22, (hour - 16.5) / 2.5) }
  if (hour < 21) return { color: lerpColor(DUSK, NIGHT, (hour - 19) / 2), alpha: lerp(0.22, 0.5, (hour - 19) / 2) }
  return { color: NIGHT, alpha: lerp(0.5, 0.55, Math.min(1, (hour - 21) / 3)) }
}

// Có phải ban đêm (dùng cho hiệu ứng đom đóm)?
export const isNight = (hour: number): boolean => hour >= 20
