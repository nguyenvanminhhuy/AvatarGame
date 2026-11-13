// Âm thanh tạm: tiếng bíp tổng hợp bằng WebAudio (chưa có file âm thanh thật).
// Trình duyệt chỉ cho phát sau thao tác của người dùng, nên gọi resumeAudio() khi nhấn phím/chuột.
import Phaser from 'phaser'

export type SfxKind = 'click' | 'plant' | 'water' | 'harvest' | 'sell' | 'buy' | 'error'

const SETTINGS_KEY = 'avatar-settings'

let ctx: AudioContext | null = null
let muted = readMuted()

function readMuted(): boolean {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return false
    const d: unknown = JSON.parse(raw)
    return typeof d === 'object' && d !== null && (d as { muted?: unknown }).muted === true
  } catch {
    return false
  }
}

export function initAudio(scene: Phaser.Scene) {
  // Phaser chọn WebAudio hoặc không có âm thanh; chỉ dùng context khi có.
  if (scene.sound instanceof Phaser.Sound.WebAudioSoundManager) ctx = scene.sound.context
}

export function resumeAudio() {
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {})
}

export const isMuted = () => muted

export function toggleMute(): boolean {
  muted = !muted
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ muted }))
  } catch {
    // không lưu được: vẫn dùng trong phiên này
  }
  return muted
}

function tone(freq: number, dur: number, type: OscillatorType, vol: number, delay = 0, slideTo?: number) {
  if (!ctx) return
  const t0 = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur)
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(gain).connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

export function sfx(kind: SfxKind) {
  if (muted || !ctx || ctx.state !== 'running') return
  switch (kind) {
    case 'click':
      tone(660, 0.07, 'sine', 0.12)
      break
    case 'plant':
      tone(200, 0.14, 'triangle', 0.2, 0, 110)
      break
    case 'water':
      tone(900, 0.09, 'sine', 0.12, 0, 600)
      tone(800, 0.09, 'sine', 0.1, 0.08, 500)
      break
    case 'harvest':
      tone(523, 0.12, 'sine', 0.15)
      tone(659, 0.12, 'sine', 0.15, 0.09)
      tone(784, 0.2, 'sine', 0.15, 0.18)
      break
    case 'sell':
      tone(988, 0.08, 'square', 0.07)
      tone(1319, 0.18, 'square', 0.07, 0.07)
      break
    case 'buy':
      tone(700, 0.1, 'triangle', 0.14, 0, 900)
      break
    case 'error':
      tone(160, 0.16, 'sawtooth', 0.09, 0, 110)
      break
  }
}
