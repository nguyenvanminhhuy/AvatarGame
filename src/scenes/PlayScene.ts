import Phaser from 'phaser'

const SPEED = 150 // pixel / giây
const WORLD_W = 960
const WORLD_H = 540

export class PlayScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>

  constructor() {
    super('Play')
  }

  create() {
    this.add.text(10, 10, 'PlayScene', { color: '#ffffff' }).setScrollFactor(0) // chữ cố định trên màn hình

    // Thế giới lớn hơn khung nhìn (640x360) để camera có việc để làm.
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H)
    this.add.rectangle(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 0x40916c) // nền để thấy camera di chuyển

    // Tường: static body (không di chuyển, không bị đẩy).
    const walls = this.physics.add.staticGroup()
    this.addWall(walls, 480, 270, 200, 24) // tường ngang giữa map
    this.addWall(walls, 700, 400, 24, 160) // tường dọc

    // Nhân vật tạm: 32x48. Body vật lý mặc định theo kích thước hình.
    this.player = this.add.rectangle(320, 180, 32, 48, 0xffd166)
    this.physics.add.existing(this.player)
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setCollideWorldBounds(true)

    this.physics.add.collider(this.player, walls)

    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H)
    this.cameras.main.startFollow(this.player, true)

    const keyboard = this.input.keyboard!
    this.cursors = keyboard.createCursorKeys()
    this.wasd = keyboard.addKeys('W,A,S,D') as typeof this.wasd
  }

  private addWall(group: Phaser.Physics.Arcade.StaticGroup, x: number, y: number, w: number, h: number) {
    const wall = this.add.rectangle(x, y, w, h, 0x6c584c)
    this.physics.add.existing(wall, true) // true = static
    group.add(wall)
  }

  update() {
    let dx = 0
    let dy = 0
    if (this.cursors.left.isDown || this.wasd.A.isDown) dx -= 1
    if (this.cursors.right.isDown || this.wasd.D.isDown) dx += 1
    if (this.cursors.up.isDown || this.wasd.W.isDown) dy -= 1
    if (this.cursors.down.isDown || this.wasd.S.isDown) dy += 1

    // Chuẩn hóa để đi chéo không nhanh hơn đi thẳng (độ dài vector = 1).
    if (dx !== 0 && dy !== 0) {
      const len = Math.hypot(dx, dy)
      dx /= len
      dy /= len
    }

    // Arcade tự nhân vận tốc (pixel/giây) với thời gian mỗi bước nên KHÔNG nhân delta ở đây.
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setVelocity(dx * SPEED, dy * SPEED)
  }
}
