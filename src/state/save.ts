// Lưu cục bộ bằng localStorage. Có thể bị sửa hoặc mất nên không dùng làm dữ liệu tin cậy cho online.
import { parseSave, serializeSave, type GameState } from './GameState.ts'

const KEY = 'avatar-save'

export function loadGame(plotIds: string[]): GameState | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? parseSave(raw, plotIds) : null
  } catch {
    return null // localStorage bị chặn hoặc lỗi: chơi mới
  }
}

// 'none': chưa có dữ liệu; 'ok': đọc được; 'corrupt': có dữ liệu nhưng hỏng/sai phiên bản.
export function checkSave(plotIds: string[]): 'none' | 'ok' | 'corrupt' {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return 'none'
    return parseSave(raw, plotIds) ? 'ok' : 'corrupt'
  } catch {
    return 'none'
  }
}

export function saveGame(s: GameState): void {
  try {
    localStorage.setItem(KEY, serializeSave(s))
  } catch {
    // Không lưu được (đầy hoặc bị chặn): bỏ qua, game vẫn chạy.
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // bỏ qua
  }
}
