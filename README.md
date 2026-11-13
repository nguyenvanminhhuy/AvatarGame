# Nông Trại Nhỏ (tên tạm)

Game web 2D chơi đơn, tự vẽ và tự lập trình, lấy cảm hứng từ trải nghiệm nông trại. Góc nhìn 3/4 trên xuống, phong cách cartoon mượt.

Công nghệ: Phaser 4, TypeScript, Vite, pnpm.

## Chạy dự án
Yêu cầu: Node.js 22+, pnpm.

```powershell
pnpm install
pnpm dev       # chạy dev server (thường tại http://localhost:5173)
pnpm build     # kiểm tra TypeScript và build production vào dist/
pnpm preview   # xem thử bản build
pnpm test      # test logic game (túi đồ, mua bán, vòng chơi, lưu)
```

## Cách chơi
- WASD / mũi tên: di chuyển. E: tương tác. Q: đổi hạt giống. I hoặc nút menu: túi đồ. Nút thư: đơn hàng. Nút Xong: đóng bảng. H: hướng dẫn. M: bật/tắt âm thanh.
- Game bắt đầu ở khu chợ: lái buôn (áo vàng, nón lá) cho hạt giống, giao đơn hàng và mua bán; bước qua cổng FARM để vào nông trại; đi xuống lối ở tường dưới nông trại để về khu chợ. Bảng tin (E) xem đơn hàng, cửa hàng (E) mua/bán/nâng cấp/mua vật nuôi.
- Nông trại là một dải ngang cố định 54x17 ô, cuộn theo nhân vật (chỉ trái-phải), từ trái sang phải: khu chăn nuôi, nhà bếp, nhà kho, khu trồng trọt (4 lô ruộng), hồ cá (có sẵn). Mỗi khu có biển "MUA" riêng để mở rộng: thêm chỗ nuôi, thêm 1 ô đất mỗi lần mua (mỗi lô 6x3 = 18 ô, có sẵn 9 ô, tối đa 72 ô; biển cắm ngay ô sắp mở), khung chuồng và sân hồ lớn dần theo cấp, thêm hàng ô nước, thêm mẻ nấu cùng lúc, thêm sức chứa kho.
- Mở khóa theo cấp mở rộng (biển MUA), không cần xong đơn hàng: cà chua (ruộng cấp 1), gà và thức ăn (chăn nuôi cấp 1), vịt và heo (cấp 2), bò (cấp 3). Gà, vịt thả rông ở bãi cỏ cạnh nhà bếp/nhà kho; heo, bò ở trong chuồng; cá nuôi trong hồ (mua ở tab Vật nuôi, nuôi nhiều con, hồ rộng ra theo cấp; hồ cấp 0 có 3x3 chỗ). Cho ăn bằng MỘT lần bấm E cho cả nhóm: rải thóc ra đất (gà, vịt), đổ cám heo/cỏ khô bò vào máng, rải thức ăn cá xuống hồ; mỗi con đói dùng 1 phần thức ăn đúng loài (cám heo mở ở chăn nuôi cấp 2, cỏ khô cấp 3). Khung chuồng và sân hồ lớn dần theo cấp mở rộng. Rồi nhặt/vớt sản phẩm. Đơn hàng vẫn còn, chỉ thưởng tiền. Game bắt đầu với 100.000 tiền để thử mọi chức năng (START_MONEY).
- Cửa hàng, nhà kho, nhà bếp dùng cả chuột và bàn phím: ←→ hoặc A D đổi tab, ↓ / S xuống các ô, ↑ / W lên tab, Enter mua/bán/nấu, F nút phụ, E hoặc ESC đóng.
- Vòng chơi: nhận hạt từ người bán hàng → trồng → tưới → chờ lớn (cà rốt 20 giây, cà chua 45 giây) → thu hoạch → bán → mua thêm hạt.
- Tiến trình tự lưu trong trình duyệt (localStorage). Delete hai lần để xóa và chơi lại.

## Art
Toàn bộ hình là pixel-art do chủ dự án cung cấp trong `art-source/` (xem [CREDITS.md](CREDITS.md)). `pnpm art` (tools/import-art.mjs) chép các ảnh dùng trong game vào `public/assets/game/` với tên khóa phẳng và sinh `src/assets.gen.ts` (danh sách khóa + bảng frame của atlas môi trường). Mọi ảnh là bản 4x của pixel-art gốc; game vẽ thu nhỏ (ô 32 px = 0,25x, vật thể lớn 0,5x). Muốn thay hình: sửa/ghi đè file trong `art-source/` rồi chạy lại `pnpm art`. Xem [docs/ART_GUIDE.md](docs/ART_GUIDE.md).

## Kiểm thử end-to-end
`pnpm e2e` mở dev server + Edge headless, chạy hai kịch bản rồi tự tắt hết (không để chạy ngầm). `tools/e2e.mjs` chơi thật một vòng bằng trình duyệt headless; `tools/e2e-extra.mjs` kiểm tra mất focus, bước thời gian lớn và các kích thước màn hình. Cách chạy ghi ở đầu file.

## Tài liệu
- [GAME_PROJECT_CONTEXT.md](GAME_PROJECT_CONTEXT.md): bối cảnh, lộ trình, nhật ký bàn giao.
- [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md): thiết kế bản đầu.
- [docs/ART_GUIDE.md](docs/ART_GUIDE.md): quy chuẩn đồ họa.
