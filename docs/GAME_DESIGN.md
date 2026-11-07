# GAME_DESIGN — Bản đầu (chơi đơn)
Ngày: 07/11/2026
Trạng thái: Bản nháp chờ chủ dự án duyệt. Chưa có code.

## 1. Quyết định đã chốt
- Nền tảng: web game, chơi trên PC (Phaser + TypeScript + Vite).
- Điều khiển bản đầu: WASD/mũi tên để di chuyển, phím E để tương tác. Không click-to-move.
- Công cụ vẽ: Piskel.
- Quỹ thời gian: khoảng 2 giờ/ngày. Kinh nghiệm vẽ pixel art: chưa có.
- Góc nhìn đích: isometric.
- Thứ tự thực hiện: prototype logic bằng top-down hình chữ nhật trước, sau đó thử isometric ở một bước riêng (xem mục 6).

## 2. Mục tiêu người chơi
Chăm một khu vườn nhỏ: trồng cây, thu hoạch, bán lấy tiền, dùng tiền mua thêm hạt giống.

## 3. Vòng chơi
Nhận hạt → trồng → tưới → chờ lớn → thu hoạch → bán → mua hạt.

### Lượt chơi mẫu
1. Người chơi bắt đầu trong căn nhà nhỏ.
2. Đi đến NPC, nhấn E để nói chuyện và nhận 3 hạt giống.
3. Ra sân vườn, đứng cạnh ô đất trống, nhấn E để trồng.
4. Nhấn E lần nữa để tưới.
5. Chờ cây qua các giai đoạn lớn; khi chín thì nhấn E để thu hoạch.
6. Đến cửa hàng của NPC, bán nông sản, thấy tiền tăng.
7. Dùng tiền mua thêm hạt và lặp lại.

## 4. Phạm vi bản đầu
- Một bản đồ nhỏ (nhà + sân vườn), một nhân vật, một NPC.
- Một loại cây, một loại hạt.
- Túi đồ, tiền, cửa hàng đơn giản.
- Lưu tiến trình cục bộ.

### Để sau (không làm trong bản đầu)
Multiplayer, chat, giao dịch, nhiều bản đồ, trang phục, bạn bè, mobile, click-to-move, đi chéo 8 hướng.

## 5. Câu hỏi còn mở (cần chốt trước khi vẽ nhân vật)
- Cây có lớn khi người chơi offline không? (đề xuất: không, chỉ lớn khi đang mở game, để đơn giản)
- Cây cần tưới mấy lần? (đề xuất: 1 lần)
- Mũi tên "lên" trên màn hình isometric nghĩa là đi theo hướng nào? (đề xuất: lên-phải; chốt ở bước thử isometric)
- Tên game và tên nhân vật (phải là nội dung riêng, không dùng tên/thương hiệu Avatar).

## 6. Kế hoạch giảm rủi ro isometric
- Dữ liệu game dùng tọa độ lưới (cột, hàng), không dùng pixel. Ô đất có ID ổn định.
- Hiển thị gọi một hàm chuyển lưới → màn hình. Ban đầu hàm này là top-down; khi chuyển sang isometric chỉ đổi hàm này và thứ tự vẽ (depth).
- Bước thử riêng: vẽ 3 tile thoi (đề xuất 32×16) và một nhân vật một hướng, đặt lên lưới, đánh giá có đạt cảm giác mong muốn không. Quyết định tiếp tục hay quay lại top-down sau bước này.

## 7. Danh sách asset tối thiểu (dự kiến)
| Nhóm | Asset |
|---|---|
| Tile | cỏ, đất, đất đã tưới, sàn nhà, tường |
| Cây | hạt, mầm, cây lớn, cây chín (4 giai đoạn) |
| Nhân vật | đứng + đi, các hướng chốt sau bước thử isometric |
| NPC | một nhân vật đứng yên |
| UI | khung hội thoại, ô túi đồ, biểu tượng tiền, gợi ý phím E |
| Vật phẩm | hạt, nông sản |
