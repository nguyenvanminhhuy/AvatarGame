import Phaser from 'phaser'
import { env } from '../art'
import { ALL_PLOT_IDS } from '../data/world'
import { initAudio, isMuted, resumeAudio, sfx, toggleMute } from '../audio'
import { checkSave, clearSave } from '../state/save'

export const GAME_TITLE = 'Nông Trại Nhỏ' // tên tạm, chủ dự án sẽ đặt tên riêng

export class TitleScene extends Phaser.Scene {
  private newArmedUntil = 0
  private muteText!: Phaser.GameObjects.Text
  private note!: Phaser.GameObjects.Text

  constructor() {
    super('Title')
  }

  create() {
    initAudio(this)
    this.newArmedUntil = 0
    const W = this.scale.width
    const H = this.scale.height
    const stroke = { stroke: '#000000', strokeThickness: 4 }

    this.cameras.main.setBackgroundColor('#7cc24f')
    for (let x = 0; x < W; x += 32) for (let y = 0; y < H; y += 32) this.add.image(x, y, 'env', env('grass_a')).setOrigin(0).setScale(0.25)
    this.add.image(W / 2 - 150, H / 2 + 130, 'boy_idle_front_1').setDisplaySize(160, 160).setOrigin(0.5, 0.95)
    this.add.image(W / 2 + 150, H / 2 + 130, 'npc_trader_1').setScale(0.6).setOrigin(0.5, 0.97)

    this.add
      .text(W / 2, 70, GAME_TITLE, { fontFamily: 'sans-serif', fontSize: '56px', fontStyle: 'bold', color: '#fff6c8', ...stroke })
      .setOrigin(0.5)

    const status = checkSave(ALL_PLOT_IDS)
    const lines =
      status === 'ok'
        ? ['[Enter] Tiếp tục', '[N] Chơi mới (nhấn hai lần, xóa tiến trình cũ)']
        : ['[Enter] hoặc nhấp chuột để bắt đầu']
    this.add
      .text(W / 2, 150, lines.join('\n'), { fontFamily: 'sans-serif', fontSize: '22px', color: '#ffffff', align: 'center', ...stroke })
      .setOrigin(0.5, 0)

    this.add
      .text(
        W / 2,
        H - 120,
        'WASD / mũi tên: di chuyển   |   E: tương tác   |   H: hướng dẫn   |   M: âm thanh\n' +
          'Mục tiêu: nhận hạt → trồng → tưới → chờ lớn → thu hoạch → bán → mua thêm hạt',
        { fontFamily: 'sans-serif', fontSize: '16px', color: '#ffffff', align: 'center', ...stroke },
      )
      .setOrigin(0.5, 0)

    this.note = this.add
      .text(W / 2, 250, status === 'corrupt' ? 'Dữ liệu lưu cũ bị lỗi hoặc không đọc được. Bạn sẽ bắt đầu chơi mới.' : '', {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#ffd0d0',
        ...stroke,
      })
      .setOrigin(0.5, 0)
    this.muteText = this.add.text(W - 12, 8, '', { fontFamily: 'sans-serif', fontSize: '14px', color: '#ffffff', ...stroke }).setOrigin(1, 0)
    this.refreshMute()

    const kb = this.input.keyboard!
    const K = Phaser.Input.Keyboard.KeyCodes
    const start = () => {
      resumeAudio()
      sfx('click')
      this.scene.start('Play')
    }
    kb.addKey(K.ENTER).on('down', start)
    kb.addKey(K.SPACE).on('down', start)
    kb.addKey(K.M).on('down', () => {
      resumeAudio()
      toggleMute()
      this.refreshMute()
    })
    kb.addKey(K.N).on('down', () => {
      if (status !== 'ok') return start()
      if (this.time.now < this.newArmedUntil) {
        clearSave()
        start()
      } else {
        this.newArmedUntil = this.time.now + 3000
        this.note.setText('Nhấn N lần nữa trong 3 giây để XÓA tiến trình cũ và chơi mới.')
      }
    })
    // Nhấp chuột chỉ để bắt đầu khi chưa có save (tránh bấm nhầm vào "chơi mới"); có save thì tiếp tục.
    this.input.once('pointerdown', start)
  }

  private refreshMute() {
    this.muteText.setText(`M: âm thanh ${isMuted() ? 'TẮT' : 'BẬT'}`)
  }
}
