import Phaser from 'phaser'

export class PlayScene extends Phaser.Scene {
  constructor() {
    super('Play')
  }

  create() {
    this.add.text(10, 10, 'PlayScene', { color: '#ffffff' })

    // Nhân vật tạm: hình chữ nhật 32x48 (khớp khung nhân vật dự kiến).
    // add.rectangle nhận tọa độ TÂM (x, y), không phải góc trên-trái.
    this.add.rectangle(320, 180, 32, 48, 0xffd166)
  }
}
