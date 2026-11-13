import Phaser from 'phaser'

// Bộ giao diện gỗ (art-source/farm_ui_kit_wood): nút và tab 9-slice, vẽ ở tỉ lệ nguyên PX (1 pixel gốc = PX pixel màn hình).
// Ảnh trong game là bản 4x của pixel-art gốc nên nine-slice vẽ lớn (4/PX) lần rồi thu nhỏ về PX/4.
export const PX = 2
export type NineInset = [left: number, right: number, top: number, bottom: number]
// Inset (pixel gốc) theo manifest của bộ kit.
export const BTN_NINE: NineInset = [6, 6, 6, 7]
export const TAB_NINE: NineInset = [9, 9, 8, 4]
export const BTN_H = 18 * PX // chiều cao nút chuẩn (36 px màn hình)
export const TAB_OFF_H = 20 * PX
export const TAB_ON_H = 24 * PX

export type BtnKind = 'gold' | 'green' | 'red' | 'brown' | 'grey'

// Tâm (x, y), rộng w x cao h tính theo pixel màn hình. Viền luôn đúng tỉ lệ nguyên, chỉ phần giữa co giãn.
export function kitNine(scene: Phaser.Scene, x: number, y: number, w: number, h: number, key: string, nine: NineInset): Phaser.GameObjects.NineSlice {
  const k = 4 / PX
  const [l, r, t, b] = nine
  return scene.add.nineslice(x, y, key, undefined, w * k, h * k, l * 4, r * 4, t * 4, b * 4).setScale(1 / k)
}

export const buttonKey = (kind: BtnKind, pressed = false) => `kit_btn_${kind}${pressed && kind !== 'grey' ? '_pressed' : ''}`
export const kitButton = (scene: Phaser.Scene, x: number, y: number, w: number, kind: BtnKind, h = BTN_H) => kitNine(scene, x, y, w, h, buttonKey(kind), BTN_NINE)
