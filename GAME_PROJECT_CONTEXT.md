# GAME_PROJECT_CONTEXT — Dự án game web 2D tự vẽ và lập trình
Ngày khởi tạo: 03/11/2026
Trạng thái: Lập kế hoạch; chưa xác nhận đã tạo source hoặc hoàn thành tính năng.

## 1. Cách dùng tài liệu
Đính kèm file này vào cuộc trò chuyện mới với AI hoặc đặt trong thư mục docs của dự án.
Đây là bối cảnh và hướng dẫn cộng tác, không phải bằng chứng rằng tính năng đã được triển khai.
Mỗi lần tiếp tục, cập nhật mục Tiến độ và Nhật ký bàn giao ở cuối.
Nếu có source, yêu cầu AI đọc source thực tế trước khi kết luận.

### Prompt khởi động cuộc trò chuyện
> Hãy đọc toàn bộ file GAME_PROJECT_CONTEXT.md này. Bạn là mentor senior về game web 2D và pixel art. Tôi muốn tự vẽ đồ họa và tự lập trình một game lấy cảm hứng từ Avatar. Hãy tóm tắt mục tiêu, xác định mốc hiện tại từ bằng chứng tôi cung cấp, rồi hướng dẫn một bước thực hành vừa sức tiếp theo. Giải thích bằng tiếng Việt, kết nối với kiến thức web của tôi. Nếu chưa có tiến độ, bắt đầu từ giai đoạn 0. Không tự giả định tôi đã hoàn thành bước nào.

## 2. Bối cảnh người học
- Tôi là frontend developer, đã dùng React, TypeScript, Tailwind CSS và VS Code.
- Tôi muốn học thêm game development, vẫn tận dụng nền tảng web.
- Tôi muốn tự thực hiện cả thiết kế gameplay, pixel art, animation, bản đồ và lập trình.
- Tôi có tìm hiểu C#/.NET; backend là giai đoạn sau.
- Tôi muốn hiểu cơ chế, tự thực hành, được review lỗi và cách cải thiện.
- Thời gian học mỗi tuần và trình độ vẽ hiện tại: chưa xác nhận.
- Không áp thời hạn hoàn thành cố định trước khi biết quỹ thời gian.

## 3. Tầm nhìn và phạm vi
### Tầm nhìn dài hạn
Game web 2D lấy cảm hứng từ trải nghiệm giao lưu, nhân vật chibi, thời trang và nông trại của Avatar.
Dùng tên, hình ảnh, bản đồ, âm thanh và nội dung do tôi tạo hoặc có quyền sử dụng.
Không sao chép tài nguyên hay thương hiệu của game gốc.

### Phạm vi bản đầu được đề xuất, chờ tôi chốt
- Chơi đơn trên PC bằng bàn phím và chuột.
- Một bản đồ nhỏ: căn phòng và/hoặc sân vườn.
- Một nhân vật, một NPC.
- Di chuyển bốn hướng, animation, va chạm, tương tác.
- Một loại cây, hạt giống, tưới nước, thu hoạch.
- Túi đồ, tiền, cửa hàng đơn giản.
- Lưu tiến trình cục bộ.
- Một vòng chơi hoàn chỉnh: nhận hạt → trồng → tưới → lớn → thu hoạch → bán → mua hạt.

### Chưa thuộc bản đầu
Multiplayer, chat, giao dịch giữa người chơi, thành phố lớn, nhiều bộ đồ, hệ thống bạn bè, mobile và kinh tế online.

## 4. Công nghệ và công cụ dự kiến
| Công việc | Công cụ | Ghi chú |
|---|---|---|
| Viết code | VS Code | Tiếp tục dùng IDE quen thuộc |
| Ngôn ngữ game | TypeScript | Không bắt buộc đổi sang C++ hoặc C# |
| Framework game | Phaser | Scene, input, animation, camera, va chạm |
| Công cụ dự án | Node.js, Vite, npm hoặc pnpm | Chọn một package manager và giữ nhất quán |
| Vẽ và animation | Piskel hoặc Aseprite | Chỉ chọn một để bắt đầu |
| Dựng bản đồ | Tiled | Ghép tileset, đánh dấu object và collision |
| Kiểm tra | Trình duyệt và DevTools | Debug và đo hiệu năng |
| Quản lý phiên bản | Git | Commit theo mốc nhỏ |
| Backend sau này | Có thể ASP.NET Core | Chưa chốt trước yêu cầu online |
| Âm thanh | Chọn khi tới giai đoạn hoàn thiện | Không cần cài tất cả ngay |

React là lựa chọn bổ sung cho giao diện web khi có nhu cầu. Bản đầu có thể dùng Phaser trực tiếp.
Phaser là framework, TypeScript là ngôn ngữ, VS Code là trình soạn thảo.
Khi cài đặt, tra tài liệu chính thức và kiểm tra phiên bản tương thích; không đoán API hoặc lệnh theo phiên bản cũ.

Nguồn tham khảo chính thức:
- https://docs.phaser.io/
- https://www.typescriptlang.org/docs/
- https://vite.dev/guide/
- https://www.piskelapp.com/
- https://www.aseprite.org/docs/
- https://docs.mapeditor.org/

## 5. Quy tắc cộng tác với AI
1. Giải thích bằng tiếng Việt, thuật ngữ tiếng Anh kèm nghĩa khi xuất hiện lần đầu.
2. Mỗi lượt tập trung một mục tiêu có thể kiểm chứng.
3. Phân biệt rõ: đề xuất, quyết định đã chốt, đã viết code và đã kiểm chứng.
4. Khi dạy, ưu tiên bài tập nhỏ và gợi ý; chỉ đưa lời giải hoàn chỉnh nếu tôi yêu cầu hoặc đang cần sửa lỗi cụ thể.
5. Khi được yêu cầu triển khai, thực hiện trong phạm vi đã thống nhất, không chỉ đưa kế hoạch.
6. Khi review, đọc file hoặc ảnh thực tế; không kết luận từ mô tả không đủ.
7. Chỉ hỏi những thông tin còn thiếu làm thay đổi quyết định. Không hỏi lại điều tài liệu đã ghi.
8. Không mở rộng sang multiplayer hoặc nhiều tính năng khi vòng chơi nhỏ chưa hoàn thành.
9. Không tạo abstraction, ECS hay kiến trúc phức tạp trước nhu cầu thực tế.
10. Không tự làm thay toàn bộ hình ảnh nếu tôi đang muốn học vẽ; hãy hướng dẫn và review.
11. Không đánh dấu hoàn thành chỉ vì build thành công; phải kiểm tra hành vi liên quan.
12. Không bịa kết quả chạy, phiên bản thư viện, số liệu hiệu năng hoặc file chưa đọc.

### Mẫu một buổi hướng dẫn
- Mục tiêu và đầu ra.
- Kiến thức vừa đủ cho nhiệm vụ.
- Các bước thực hành theo thứ tự.
- Tiêu chí nghiệm thu.
- Lỗi thường gặp.
- Những gì tôi cần gửi để được review.
- Một bước tiếp theo sau khi hoàn thành.

## 6. Lộ trình thực hiện và tiêu chí nghiệm thu

### Giai đoạn 0 — Chốt thiết kế
Việc làm:
- Chốt nền tảng PC, góc nhìn, phong cách và phương thức điều khiển.
- Viết một trang GAME_DESIGN.md: người chơi, mục tiêu, vòng chơi, phạm vi.
- Phác bản đồ và danh sách asset tối thiểu.
- Đặt danh sách tính năng để sau.
Nghiệm thu: mô tả được một lượt chơi từ bắt đầu đến nhận phần thưởng; không còn tính năng mơ hồ trong bản đầu.

### Giai đoạn 1 — Chuẩn bị dự án
Việc làm:
- Kiểm tra Node.js và package manager; chọn template Phaser + TypeScript phù hợp.
- Tạo dự án, scene khởi động và scene chơi.
- Chạy môi trường phát triển và build.
- Khởi tạo Git; viết README về cách chạy.
Nghiệm thu: mở được game trên trình duyệt, không có lỗi runtime cơ bản; có commit đầu tiên.

### Giai đoạn 2 — Prototype di chuyển
Việc làm:
- Dùng hình chữ nhật hoặc sprite tạm.
- Xử lý input bốn hướng.
- Tốc độ không phụ thuộc FPS; chuẩn hóa hướng chéo nếu cho phép.
- Tường và vùng va chạm; camera theo nhân vật.
- Kiểm tra khi cửa sổ mất focus hoặc chuyển tab.
Nghiệm thu: nhân vật không xuyên tường, không đi chéo nhanh hơn; camera và điều khiển ổn.
Lưu ý: hiểu đơn vị vận tốc của API physics; không nhân delta thêm một lần nếu engine đã xử lý.

### Giai đoạn 3 — Nền tảng pixel art và quy chuẩn
Học:
- Silhouette, tỷ lệ, tương phản, bảng màu nhỏ.
- Đường viền, cụm pixel, ánh sáng và đổ bóng.
- Canvas, layer, nền trong suốt, xuất PNG.
Thực hành:
- Vẽ cỏ, đất, viên gạch.
- Vẽ một cây, một cánh cửa, nhân vật đứng cạnh nhau.
- Đưa hình vào game để kiểm tra tỷ lệ.
Quy chuẩn khởi điểm đề xuất:
- Tile 16 × 16; khung nhân vật 32 × 48 pixel.
- Bốn hướng; ánh sáng trên trái; điểm neo ở chân.
- Scale theo số nguyên và tắt làm mịn khi phù hợp.
Các con số là lựa chọn thử nghiệm, không phải tiêu chuẩn bắt buộc.
Nghiệm thu: chốt ART_GUIDE.md và một bộ hình mẫu nhất quán.

### Giai đoạn 4 — Nhân vật và animation
Việc làm:
- Vẽ đứng trước, sau, trái, phải.
- Vẽ chu kỳ đi bộ khoảng 3–4 frame mỗi hướng để thử.
- Giữ bàn chân và điểm neo nhất quán; kiểm tra nhịp chân và độ rung.
- Xuất sprite sheet, đặt tên animation.
- Chuyển idle/walk theo trạng thái thật.
Nghiệm thu: đúng hướng, không trượt hình hoặc nhảy vị trí khi đổi animation.

### Giai đoạn 5 — Bản đồ và chiều sâu
Việc làm:
- Vẽ tileset nhỏ, kiểm tra các mép ghép.
- Tạo layer nền, vật thể, vật thể phía trước, collision và object trong Tiled.
- Đặt spawn, NPC, cửa và đất trồng bằng dữ liệu.
- Nạp bản đồ trong Phaser.
- Xử lý depth theo chân cho vật thể cần sắp xếp động.
Nghiệm thu: đi trước/sau cây đúng, collision không chặn nhầm, spawn hợp lệ.

### Giai đoạn 6 — Tương tác và hội thoại
Việc làm:
- Xác định mục tiêu gần hoặc trước mặt.
- Hiện gợi ý phím E; xử lý một lần nhấn.
- Hội thoại NPC, mở/đóng cửa sổ, khóa input phù hợp.
- Không để phím thao tác giao diện đồng thời kích hoạt gameplay.
Nghiệm thu: đúng đối tượng, không kích hoạt ngoài tầm; đóng hội thoại trả lại điều khiển.

### Giai đoạn 7 — Túi đồ và dữ liệu
Việc làm:
- Định nghĩa ID vật phẩm và catalog dữ liệu.
- Tách dữ liệu định nghĩa với số lượng vật phẩm người chơi sở hữu.
- Thêm/bớt, kiểm tra số lượng, stack và giới hạn nếu có.
- Hiển thị túi đồ; thiết lập nguồn trạng thái rõ ràng.
Nghiệm thu: không có số lượng âm, không mất vật phẩm vì thao tác lỗi; UI khớp dữ liệu.

### Giai đoạn 8 — Vòng chơi nông trại
Việc làm:
- Mỗi ô đất có ID và trạng thái rõ ràng.
- Trồng, tưới, phát triển, thu hoạch.
- Xác định cây có lớn khi offline không.
- Cửa hàng mua hạt, bán nông sản và cập nhật tiền.
- Gom giá bán, thời gian lớn và phần thưởng vào dữ liệu.
Nghiệm thu: hoàn thành được cả vòng chơi; tương tác lặp không nhân đôi phần thưởng.

### Giai đoạn 9 — Lưu game
Việc làm:
- Save schema có version; lưu dữ liệu cần thiết thay vì đối tượng engine.
- Validate dữ liệu đọc, xử lý thiếu/hỏng và có lựa chọn bắt đầu lại.
- Lưu tiền, inventory, vị trí, cây và settings.
- Nếu hỗ trợ offline growth, lưu timestamps và tính lại lúc mở game.
- Lưu cục bộ có thể bị sửa hoặc mất; chưa dùng làm dữ liệu tin cậy cho online.
Nghiệm thu: reload khôi phục đúng; dữ liệu lỗi không làm game ngừng chạy.

### Giai đoạn 10 — Hoàn thiện bản chơi đơn
Việc làm:
- Start, hướng dẫn, tải asset, thông báo lỗi và reset.
- Âm thanh, mute, phản hồi tương tác.
- Cho phép bật âm thanh sau thao tác người dùng khi trình duyệt yêu cầu.
- Kiểm tra màn hình hỗ trợ, text dễ đọc và focus.
- Cho người khác chơi thử mà không hướng dẫn trực tiếp.
Nghiệm thu: người chơi hiểu mục tiêu, hoàn thành vòng chơi và quay lại được sau reload.

### Giai đoạn 11 — Mở rộng có kiểm soát
Thứ tự:
1. Chuyển bản đồ.
2. Thêm nội dung trên hệ thống cũ.
3. Trang phục theo lớp.
4. Tài khoản và lưu server.
5. Multiplayer.
Trang phục: thử hai bộ đồ trên toàn bộ frame/hướng trước khi vẽ hàng loạt.
Nghiệm thu: mỗi tính năng có bằng chứng chạy và không phá vòng chơi cũ.

### Giai đoạn 12 — Online
Trước khi triển khai, thiết kế:
- Phòng/bản đồ, giới hạn người chơi và giao thức.
- Server xác thực hành động; client hiển thị và gửi input/yêu cầu.
- Server quyết định tiền, vật phẩm, mua bán và thu hoạch.
- Đồng bộ vị trí, nội suy, disconnect/reconnect và đổi khu vực.
- Chống yêu cầu trùng; giới hạn tần suất và kiểm soát nội dung chat.
- Không mặc định dữ liệu người chơi offline được nhập thẳng vào kinh tế online.
Nghiệm thu ban đầu: hai trình duyệt nhìn thấy nhau, di chuyển và reconnect đúng.
Backend và thư viện mạng chỉ được chốt khi yêu cầu đã rõ.

### Giai đoạn 13 — Phát hành và vận hành
Việc làm:
- Build và kiểm tra bản production trên đường link thật.
- Kiểm tra đường dẫn asset, lỗi tải và lưu tiến trình.
- Kiểm tra chơi lâu, chuyển scene nhiều lần, cleanup event/timer.
- Với online: kiểm tra mất mạng, xác thực, request trùng, giới hạn và logging.
- Viết hướng dẫn chơi, ghi nhận phản hồi, ưu tiên sửa lỗi.
Nghiệm thu: hoàn thành vòng chơi trên bản phát hành, có cách chẩn đoán lỗi và quay về bản ổn định.

## 7. Cấu trúc thư mục tham khảo
Không bắt buộc tạo toàn bộ ngay từ ngày đầu.

```text
project/
├── art-source/
│   ├── characters/
│   ├── environment/
│   └── ui/
├── public/assets/
│   ├── sprites/
│   ├── tilesets/
│   ├── maps/
│   ├── ui/
│   └── audio/
├── src/
│   ├── scenes/
│   ├── entities/
│   ├── systems/
│   ├── data/
│   ├── types/
│   └── main.ts
├── docs/
│   ├── GAME_DESIGN.md
│   ├── ART_GUIDE.md
│   └── PROGRESS.md
└── README.md
```

## 8. Quy tắc kỹ thuật
- Tách gameplay, dữ liệu và phần hiển thị đủ để dễ sửa; không overengineer.
- Trạng thái gameplay có một nguồn rõ ràng; UI phản ánh trạng thái đó.
- Logic tiền, inventory và chuyển trạng thái cần kiểm chứng riêng.
- Dọn event listener, timer và object khi rời scene.
- Giữ file vẽ gốc; xuất asset theo cách lặp lại được.
- Dùng ID ổn định cho vật phẩm, NPC và ô đất.
- Viết test cho logic dễ sai như giao dịch, thu hoạch, save migration; không tạo test chỉ để tăng số lượng.
- Không đưa secret vào frontend hoặc commit.
- Trước khi AI sửa source: xác nhận repo root, branch, git status; đọc AGENTS.md nếu có và giữ nguyên thay đổi ngoài phạm vi.
- Nếu chưa được cung cấp source hoặc công cụ truy cập, hướng dẫn thay vì tuyên bố đã sửa.

## 9. Checklist review
### Code
- Hành vi có đúng yêu cầu không?
- Có xử lý edge case và lifecycle của scene không?
- Kiến trúc có phù hợp quy mô hiện tại không?
- Đã kiểm tra gì thực tế, còn gì chưa kiểm tra?

### Đồ họa
- Dễ nhận biết khi hiển thị đúng kích thước chơi không?
- Tỷ lệ, bảng màu, ánh sáng và đường viền có nhất quán không?
- Frame có bị rung, đổi kích thước hoặc lệch chân không?
- Có file gốc, PNG trong suốt và export đúng không?

### Mẫu báo cáo review
- Kết luận: đạt / cần sửa / chưa đủ bằng chứng.
- Vấn đề: vị trí, cách tái hiện, ảnh hưởng, hướng sửa.
- Phân biệt lỗi chặn tiến độ và cải tiến tùy chọn.
- Nhiệm vụ tiếp theo sau khi sửa.

## 10. Prompt dùng lại

### Bắt đầu một mốc
> Dựa trên tài liệu này, hãy hướng dẫn giai đoạn [số/tên]. Chia thành nhiệm vụ nhỏ theo thứ tự, giải thích kiến thức cần học, đầu ra và tiêu chí nghiệm thu. Hãy bắt đầu bằng nhiệm vụ đầu tiên.

### Học vẽ
> Tôi đang ở giai đoạn [x]. Hãy hướng dẫn tôi tự vẽ [asset] bằng [Piskel/Aseprite]. Nêu canvas, layer, bảng màu, từng bước thực hành và cách kiểm tra ở kích thước thật. Tôi muốn học cách vẽ, chưa cần bạn tạo hình thay.

### Review hình vẽ
> Đây là ảnh và thông số asset của tôi. Hãy review silhouette, tỷ lệ, màu, ánh sáng, độ rõ và khả năng dùng trong game. Ưu tiên ba điểm cần sửa nhất và chỉ rõ vị trí.

### Review code
> Đọc các file tôi cung cấp và đối chiếu tiêu chí giai đoạn [x]. Chỉ ra lỗi có bằng chứng, cách tái hiện và cách sửa. Phân biệt kết quả đã chạy với suy luận từ code.

### Bàn giao cuộc trò chuyện
> Hãy tóm tắt quyết định đã chốt, việc đã làm, bằng chứng kiểm tra, lỗi còn lại và bước tiếp theo theo mẫu Nhật ký bàn giao. Không đánh dấu hoàn thành nếu chưa có bằng chứng.

## 11. Tiến độ hiện tại
- [x] Chốt phạm vi bản đầu (nháp tại docs/GAME_DESIGN.md, chờ duyệt các câu hỏi mở).
- [ ] Chọn công cụ vẽ (Piskel đã bị thay do đổi sang cartoon mượt; đề xuất Krita/Inkscape, chờ chốt).
- [x] Tạo dự án và Git (commit đầu tiên 4999f02).
- [x] Prototype di chuyển và va chạm (chủ dự án xác nhận ổn ngày 07/11/2026).
- [ ] Chốt art guide (bản nháp tại docs/ART_GUIDE.md; tile tạm do script tạo, chủ dự án sẽ tự vẽ thay).
- [ ] Nhân vật và animation.
- [ ] Bản đồ (đã có bản đồ isometric 14x14 bằng dữ liệu TS, chưa dùng Tiled; chờ chơi thử).
- [x] NPC và tương tác (e2e: hội thoại, nhận hạt, chặn đường, khóa/trả điều khiển đúng, E ngoài tầm không kích hoạt).
- [x] Inventory (test logic + e2e headless: không âm, UI khớp dữ liệu; 07-08/11/2026).
- [x] Vòng chơi nông trại (e2e headless chạy hết vòng: nhận hạt → trồng → tưới → lớn → thu hoạch → bán → mua; bấm lặp không nhân đôi).
- [x] Save/load (e2e: reload khôi phục túi đồ/tiền/ô đất/vị trí; save hỏng không làm sập, chơi mới).
- [ ] Hoàn thiện và chơi thử.
- [ ] Phát hành bản chơi đơn.
- [ ] Thiết kế mở rộng/online nếu tiếp tục.

## 12. Nhật ký bàn giao
Cập nhật: 03/11/2026
- Mốc hiện tại: chuẩn bị; đã trao đổi ý tưởng và lộ trình.
- Đã chốt: muốn tự vẽ và tự lập trình game web 2D lấy cảm hứng từ Avatar; dùng VS Code.
- Đề xuất chưa chốt: Phaser + TypeScript, công cụ vẽ, quy chuẩn asset và phạm vi nông trại chơi đơn.
- Source đã kiểm tra: chưa có.
- Tính năng đã kiểm chứng: chưa có.
- Lỗi đang mở: chưa xác định.
- Bước tiếp theo: chốt phạm vi nhỏ và chọn công cụ vẽ; sau đó chuẩn bị dự án.
- Thông tin còn thiếu khi cần: quỹ thời gian, kinh nghiệm vẽ, phần mềm đã cài.

Cập nhật: 07/11/2026
- Mốc hiện tại: Giai đoạn 0, đang hoàn tất thiết kế.
- Đã chốt: web game (Phaser + TS + Vite); Piskel; điều khiển WASD/mũi tên + E; quỹ thời gian ~2h/ngày; chưa có kinh nghiệm vẽ; góc nhìn đích isometric; prototype logic top-down trước, thử isometric ở bước riêng.
- File đã tạo: docs/GAME_DESIGN.md (bản nháp, chưa kiểm chứng bằng chơi thử).
- Source: chưa có. Tính năng đã kiểm chứng: chưa có.
- Bước tiếp theo: duyệt các câu hỏi mở trong GAME_DESIGN.md mục 5, rồi sang Giai đoạn 1 (chuẩn bị dự án).

Cập nhật: 07/11/2026 (buổi sau)
- Mốc hiện tại: Giai đoạn 3 (pixel art và quy chuẩn).
- Giai đoạn 1 và 2: xong. Stack thực tế: Phaser 4.2.1, TypeScript 7, Vite 8, pnpm.
- File/asset: src/scenes (BootScene, PlayScene), tools/gen-placeholder-tiles.mjs, public/assets/tilesets (grass, dirt, brick, iso-grass), docs/ART_GUIDE.md (nháp).
- Đã chạy: pnpm build thành công. Tile tạm đã được đưa vào game; chủ dự án chưa báo kết quả xem trong trình duyệt.
- Chưa kiểm tra: tile hiển thị sắc nét trong game; tile thoi ghép khít khi xếp isometric.
- Việc tiếp theo: bước thử isometric (đặt tile thoi lên lưới, hàm chuyển lưới → màn hình); chủ dự án tự vẽ tile trong Piskel.

Cập nhật: 07/11/2026 (buổi nhiều bước liên tục)
- Chủ dự án xác nhận bước thử isometric ổn; chuyển hẳn sang isometric, điều khiển theo hướng màn hình.
- Code mới: src/iso.ts, src/data/{items,world}.ts, src/state/{GameState,save}.ts, PlayScene viết lại (iso + nông trại + cửa hàng + lưu). Đã bỏ prototype top-down và IsoTestScene.
- Đã chạy: pnpm build thành công; pnpm test: 8/8 test logic (túi đồ, mua bán, vòng chơi, parse save) qua.
- Chưa kiểm tra: toàn bộ hành vi trong trình duyệt (vòng chơi đầy đủ, reload khôi phục, Delete xóa save, hiển thị chữ tiếng Việt).
- Chưa làm: sprite nhân vật/NPC/cây thật và animation (hiện là hình chữ nhật), Tiled, âm thanh, màn hình bắt đầu và hướng dẫn, tên game.
- Việc tiếp theo: chủ dự án chơi thử theo checklist; báo lỗi; sau đó vẽ nhân vật (giai đoạn 4).

Cập nhật: 07/11/2026 (đổi hướng đồ họa)
- Chủ dự án gửi ảnh tham khảo; QUYẾT ĐỊNH MỚI: góc nhìn 3/4 lưới vuông, phong cách cartoon mượt. Thay thế quyết định trước (isometric, pixel art, Piskel). Công cụ vẽ mới: đề xuất Krita/Inkscape, chưa chốt, chưa cài.
- Code: PlayScene chuyển về lưới vuông (ô 48px, màn 960x540, pixelArt tắt); đã bỏ src/iso.ts; world.ts dùng đơn vị ô. Logic/test/lưu không đổi. Hình hiện tại là placeholder bằng code (không dùng PNG).
- Đã chạy: pnpm build thành công; pnpm test 8/8 qua. Chưa chạy game trong trình duyệt.
- File lưu cũ (từ bản isometric) vẫn đọc được nhưng vị trí người chơi được kiểm tra, sai thì về điểm xuất phát.
- Việc tiếp theo: chủ dự án chơi thử; chọn và cài công cụ vẽ; vẽ asset đầu tiên (một nhân vật đứng, một ô đất) theo ART_GUIDE.md rồi đưa vào game.

Cập nhật: 07/11/2026 (nhân vật tạm)
- Chủ dự án đã cài Krita, nhờ AI vẽ nhân vật. AI tạo nhân vật + NPC tạm bằng SVG (tools/gen-characters.mjs), đã nạp vào game (BootScene.load.svg, PlayScene dùng Image, hiển thị 48x72, neo ở chân). Chủ dự án sẽ tự vẽ bản thật sau.
- Đã chạy: pnpm build thành công, 8/8 test qua. Đã xem ảnh render SVG bằng Edge headless. Chưa chạy trong game.
- Chưa có: animation đi bộ, các hướng khác (hiện chỉ một hướng nhìn xuống, đứng yên), sprite cây/ô đất.

Cập nhật: 07/11/2026 (art tạm đầy đủ + animation)
- Thay script cũ bằng tools/gen-art.mjs: nhân vật/NPC 4 hướng (down, up, side; phải = lật) với idle + 4 frame đi bộ, ô đất khô/ướt, cây 3 giai đoạn, cây lớn, cỏ (đều SVG). src/art.ts cắt sheet thành frame và tạo animation; PlayScene chọn animation theo trạng thái thật (đi/đứng, hướng nhìn).
- Đã kiểm chứng: pnpm build, 8/8 test; chạy bản build trong Edge headless và xem ảnh chụp: asset nạp, nền/cây/ô đất/nhân vật/NPC hiển thị. Đã sửa CSS (overflow hidden, canvas block) vì ảnh chụp có thanh cuộn.
- Chưa kiểm chứng: animation khi di chuyển thật, hướng nhìn, vòng chơi đầy đủ với sprite mới, reload (không gửi phím được trong headless).
- Chưa làm: nhân vật tự vẽ trong Krita (chủ dự án), âm thanh, màn hình bắt đầu.

Cập nhật: 08/11/2026 (giai đoạn 10)
- Mới: TitleScene (tiếp tục/chơi mới, hướng dẫn tóm tắt, báo save hỏng), BootScene có thanh tải và báo asset lỗi, panel hướng dẫn (H), âm thanh tạm bằng WebAudio (src/audio.ts) có tắt/bật (M, lưu trong avatar-settings), hiệu ứng phản hồi (chữ bay, tia sáng khi thu hoạch). Tên game tạm: "Nông Trại Nhỏ".
- Kiểm chứng thật: tools/e2e.mjs điều khiển Edge headless qua CDP, 23/23 kiểm tra qua (hội thoại, vòng chơi đầy đủ, reload, cửa hàng, mute, save hỏng, không lỗi console). pnpm build và pnpm test (8/8) qua. Đã xem ảnh chụp màn hình bắt đầu, thu hoạch, cửa hàng.
- Chưa kiểm chứng: nghe âm thanh thật (headless không nghe được), chơi trên trình duyệt/màn hình khác, người khác chơi thử không hướng dẫn, thanh cuộn sau khi sửa CSS ở cửa sổ thật, E ngoài tầm, chuyển tab giữa chừng.
- Chưa làm: nhạc nền và âm thanh thật (cần file), nhân vật/cây tự vẽ, đặt tên game, nhiều bản đồ, bản phát hành.
- Còn lại của giai đoạn 10: cho người khác chơi thử mà không hướng dẫn trực tiếp (nghiệm thu).
- Chưa commit: phần lớn thay đổi từ commit 0ccb17f trở đi chưa được commit.

Cập nhật: 08/11/2026 (giai đoạn 10, kiểm tra bổ sung)
- Thêm tools/e2e-extra.mjs: 10/10 kiểm tra qua trong Edge headless: E ngoài tầm không kích hoạt; mất focus khi đang giữ phím thì nhân vật dừng (không kẹt phím); bước thời gian 60 giây chỉ tính tối đa 250ms (cây không lớn nhảy vọt khi quay lại từ tab khác, đã mô phỏng bằng gọi update, không phải chuyển tab thật); không thanh cuộn và canvas vừa khung ở 1920x1080, 1366x768, 1024x600, 800x450.
- Đã xem ảnh 800x450: chữ HUD đọc được. Màn hình điện thoại dọc (390x844): canvas chỉ rộng 390px, chữ rất nhỏ. Thiết kế bản đầu chỉ hỗ trợ PC nên chấp nhận; chưa có giao diện cho điện thoại.
- Còn lại của giai đoạn 10 (nghiệm thu): người khác chơi thử mà không hướng dẫn; nghe thử âm thanh thật.

Cập nhật: 08/11/2026 (giai đoạn 11, mục 1: chuyển bản đồ)
- Thêm bản đồ thứ hai "Trong nhà" và căn nhà ở sân vườn. Bước vào ô cửa (17,4) ở sân thì vào nhà, bước vào thảm cửa (5,6) trong nhà thì ra sân; có hiệu ứng mờ dần/sáng dần và khóa điều khiển trong lúc chuyển. Giường trong nhà: E để nghỉ ngơi và lưu.
- Dữ liệu: src/data/world.ts chuyển sang MAPS (mỗi bản đồ có ô đất, NPC, cây, ô chặn, giường, cửa). GameState thêm trường map; SAVE_VERSION 2, vẫn đọc được save version 1 (đưa về bản đồ đầu). Art mới (SVG): house, floor, wall, bed.
- Cây ở mọi bản đồ vẫn lớn khi người chơi ở bản đồ khác (cùng quy tắc: chỉ khi game đang mở).
- Kiểm chứng: pnpm build; pnpm test 10/10 (thêm 2 test migration/map); e2e-extra 20/20 (vào nhà, vị trí xuất hiện, điều khiển trả lại, cây lớn khi ở trong nhà, giường lưu, reload trong nhà khôi phục bản đồ và vị trí, ra nhà, cây còn nguyên); e2e 23/23 (vòng chơi cũ không bị phá). Đã xem ảnh chụp trong nhà và sân vườn.
- Chưa kiểm chứng: người chơi thật thử cảm giác ra/vào cửa; đi trước/sau căn nhà (depth) mới xem qua ảnh, chưa có kiểm tra tự động; save v1 thật từ trình duyệt của chủ dự án (chỉ test bằng dữ liệu giả lập).
- Giai đoạn 11 còn lại theo thứ tự: 2) thêm nội dung trên hệ thống cũ (cây trồng mới, vật phẩm); 3) trang phục theo lớp; 4) tài khoản và lưu server; 5) multiplayer. Giai đoạn 12 (online) chỉ làm sau khi thiết kế xong.

Cập nhật: 09/11/2026 (giai đoạn 11, mục 2: thêm nội dung trên hệ thống cũ)
- Thêm cây cà chua: hạt 25 tiền, lớn 45 giây (cà rốt: 10 tiền, 20 giây), bán 70/cái. Chọn loại hạt để trồng bằng phím Q (HUD hiện hạt đang chọn); cửa hàng liệt kê mọi hạt có giá mua và phím tiếp theo bán toàn bộ nông sản (hiện: 1 cà rốt, 2 cà chua, 3 bán). Thêm art cà chua chín (SVG).
- Tổng quát hóa logic: mỗi ô đất ghi loại cây (crop), thời gian lớn và vật phẩm thu hoạch lấy từ CROPS. Thêm cây mới sau này chỉ cần thêm dữ liệu trong src/data/items.ts và một ảnh chín.
- Save version 3 (thêm crop mỗi ô). Đọc được save version 1 và 2: ô đang trồng được coi là cà rốt. Dữ liệu v3 có crop sai bị từ chối.
- Kiểm chứng: pnpm build; pnpm test 16/16 (thêm test cà chua, hạt lạ, bán hết nông sản, mua hạt, migrate v2, từ chối crop sai); e2e 25/25 và e2e-extra 27/27 trong Edge headless (chọn hạt Q, trồng cà chua, chưa chín ở 25 giây, chín ở 45 giây, thu hoạch ra cà chua, mua hạt cà chua ở cửa hàng, vòng chơi cà rốt cũ không bị phá). Đã xem ảnh cửa hàng và HUD.
- Bài học: lần chạy đầu của e2e-extra thất bại 10 mục vì kịch bản tự bơm trạng thái ô đất thiếu trường crop mới; game từ chối lưu dữ liệu đó (đúng thiết kế) nên reload bắt đầu chơi mới. Khi đổi cấu trúc trạng thái, phải cập nhật cả kịch bản kiểm thử.
- Chưa kiểm chứng: bán cà chua ở cửa hàng bằng phím trong game thật (logic có test, e2e chưa mua rồi bán cà chua); cân bằng kinh tế (giá, thời gian) chưa được người chơi thật thử; chưa có ảnh/icon vật phẩm trong túi đồ (chỉ chữ).
- Giai đoạn 11 còn: 3) trang phục theo lớp (cần art của chủ dự án); 4) tài khoản và lưu server; 5) multiplayer. Mục 4 và 5 thuộc giai đoạn 12 (online), cần thiết kế trước khi làm.

Cập nhật: 09/11/2026 (hướng phát triển gameplay + đồ họa, bước A và B)
- Chủ dự án chọn phát triển TẤT CẢ: nhiệm vụ/tiến trình, năng lượng + ngày/đêm, công cụ/nâng cấp, vật nuôi; đồ họa: icon + giao diện, ánh sáng/môi trường, trang trí bản đồ, nhân vật/animation đẹp hơn. Hoãn phát hành (giai đoạn 13) và online (giai đoạn 12) đến khi gameplay/đồ họa tốt hơn.
- Thứ tự đã thống nhất: A icon + giao diện → B nhiệm vụ → C công cụ/nâng cấp → D năng lượng + ngày/đêm + ánh sáng → E vật nuôi → F trang trí bản đồ → G nhân vật tự vẽ (chủ dự án, AI hướng dẫn/review).
- Bước A xong: icon SVG cho 4 vật phẩm + đồng xu (tools/gen-art.mjs), HUD dạng ô (src/ui/Hud.ts: tiền kèm icon, một ô cho mỗi vật phẩm trong catalog, ô hạt đang chọn viền vàng, ô chưa có thì mờ), bảng hội thoại/cửa hàng/hướng dẫn có khung. Bắt được và sửa 1 lỗi thật: hạt đang chọn chỉ cập nhật khi ở chế độ chơi, nên vừa nhận/mua hạt trong hội thoại hoặc cửa hàng thì chưa được chọn.
- Bước B xong: chuỗi 3 đơn hàng ở người bán hàng (src/data/quests.ts): first_order (3 cà rốt, +90, mở bán hạt cà chua), tomato_party (2 cà chua, +220), big_garden (6 cà rốt + 3 cà chua, +500, mở thêm 3 ô đất). Cửa hàng: phím 1..n mua, n+1 bán toàn bộ nông sản, n+2 giao đơn hàng; hàng chưa mở hiện dòng "chưa mở: hoàn thành ...". Bảng theo dõi đơn hàng góc trên-phải. Logic: G.currentQuest/questProgress/deliver (kiểm tra đủ hàng trước khi trừ, mỗi đơn chỉ nhận thưởng một lần), G.isBuyable, buy trả 'locked' khi chưa mở.
- Save version 4 (thêm flags.done). Đọc được bản 1–3 (done rỗng). Ô đất thêm mới sau khi lưu được tạo trống (thêm nội dung không làm hỏng save cũ); ô đất có trong save nhưng sai định dạng vẫn bị từ chối.
- Kiểm chứng: pnpm build; pnpm test 23/23; e2e 34/34 và e2e-extra 29/29 (Edge headless, gửi phím thật): HUD khớp trạng thái, giao đơn thiếu hàng không nhận thưởng, giao đủ trừ đúng hàng + thưởng, giao lặp lại không nhận hai lần, mở khóa hạt cà chua rồi mua được, ô đất hàng 3 ẩn rồi hiện sau đơn "Mở rộng vườn". Đã xem ảnh HUD, cửa hàng có đơn hàng, ô đất mở khóa.
- Kiểm thử chập chờn: e2e-extra từng thất bại ngẫu nhiên 2 lần trong khoảng 12 lần chạy, đều do kịch bản đi quá điểm dừng khi máy bận (đi quá thảm cửa, đứng sai ô đất), không phải lỗi game. Đã thêm hàm goTo (căn chỉnh theo vị trí thật, không dựa vào thời gian); sau đó 2/2 lần chạy qua. Nếu còn chập chờn, xem lại các điểm dừng dựa trên thời gian.
- Chưa kiểm chứng: cảm giác chơi thật và cân bằng đơn hàng (chưa có người chơi thật thử); giao diện cửa hàng khi có từ 3 loại hạt trở lên (tối đa 5 phím, chưa thử); icon ở kích thước nhỏ chỉ xem qua ảnh.
- Việc tiếp theo: bước C (công cụ và nâng cấp: tiêu tiền vào mở rộng/nâng cấp) rồi D (năng lượng, ngày/đêm, ánh sáng).

Cập nhật: 09/11/2026 (bước C và D)
- Bước C xong (công cụ và nâng cấp): trang Nâng cấp ở cửa hàng (phím U để chuyển trang, phím 1-3 mua). Ba nâng cấp (src/data/upgrades.ts), mỗi loại 2 cấp: Phân bón (200/500 tiền, cây lớn nhanh hơn 25%/50%); Bình tưới lớn (300/700, tưới 3 ô cùng hàng / khối 3x3, chỉ tốn năng lượng một lần); Thể lực (150/400, năng lượng tối đa +25 mỗi cấp). Logic: G.buyUpgrade (kiểm tra tiền trước khi trừ, giới hạn cấp), G.growthMultiplier, G.waterLevel, plotsInArea (src/data/world.ts).
- Bước D xong (năng lượng, ngày/đêm, ánh sáng): năng lượng tối đa 100; trồng -4, tưới -3, thu hoạch -4, di chuyển không tốn; thiếu năng lượng thì từ chối (không mất hạt, không đổi ô đất). Đồng hồ game 06:00-24:00, một ngày = 4,5 phút thật (15 giây thật = 1 giờ game), chỉ trôi khi game mở. Qua 24:00 sang ngày mới, chỉ hồi 60% năng lượng. Giường ngủ được từ 18:00 (mờ dần, sang ngày mới, đầy năng lượng); trước 18:00 chỉ nghỉ và lưu. Ánh sáng: rạng sáng hơi tối, ban ngày sáng, chiều ấm cam, đêm tối xanh (src/state/clock.ts), có đom đóm ban đêm ngoài trời; trong nhà không phủ. HUD: ngày/giờ và thanh năng lượng (xanh/vàng/đỏ).
- Save version 5 (thêm day, time, energy, upgrades). Đọc được bản 1-4 (ngày 1, đầu ngày, đầy năng lượng, chưa nâng cấp). Năng lượng vượt tối đa, cấp nâng cấp sai, thời gian ngoài [0, DAY_MS) bị từ chối.
- Kiểm chứng: pnpm build; pnpm test 37/37 (thêm tests/Progress.test.ts, 14 test: năng lượng, nâng cấp, phân bón, thể lực, vùng tưới, đồng hồ, qua nửa đêm, ngủ, ánh sáng, save v5/migrate v4); e2e 39/39 và e2e-extra 40/40 (2 lần liên tiếp) trong Edge headless, gửi phím thật: HUD năng lượng và giờ, mua nâng cấp qua cửa hàng (U), không đủ năng lượng thì không trồng, bình tưới lớn tưới đúng vùng và trừ một lần, đồng hồ trôi theo thời gian thật, đêm tối và đom đóm hiện, ngày sáng, qua nửa đêm hồi 60%, giường trước/sau 18:00, sau khi ngủ ở PlayScene và có lời chào. Đã xem ảnh ban đêm, vùng tưới, HUD.
- Lưu ý kiểm thử: kịch bản gọi trực tiếp useBed() thay vì đi đến giường rồi nhấn E (đường đi đến giường đã được kiểm ở phần chuyển bản đồ); đặt time/energy bằng cách sửa state trực tiếp. Hai lỗi ban đầu của e2e-extra đều do kịch bản: đặt giờ chỉ còn 50 ms trước nửa đêm nên game qua nửa đêm trước khi kịch bản kịp đọc "ngày trước" (đã chừa 1,2 giây).
- Chưa kiểm chứng: cân bằng (giá nâng cấp, mức tiêu hao năng lượng, độ dài ngày 4,5 phút) chưa có người chơi thật thử; cảm giác chơi khi hết năng lượng giữa ngày; màu ánh sáng chỉ xem qua ảnh chụp; cửa hàng khi vượt 5 phím (hàng + bán + giao); chưa có âm thanh riêng cho ngủ/hết năng lượng.
- Việc tiếp theo trong thứ tự đã thống nhất: E vật nuôi (gà, vịt), F trang trí bản đồ, G nhân vật tự vẽ (chủ dự án).

Cập nhật: 09/11/2026 (bước E vật nuôi và bước F trang trí; chủ dự án sẽ tự cân chỉnh C và D)
- Bước E xong (vật nuôi): chuồng ở phía trên giữa sân vườn (hàng rào cột 8 và 13, 4 chỗ ở hàng 1 cột 9-12). Gà (120 tiền, trứng gà sau 40 giây, bán 40) và vịt (260 tiền, trứng vịt sau 70 giây, bán 80). Mở khóa sau đơn hàng "Cà chua cho bữa tiệc" (cũng mở bán Thức ăn 8 tiền). Quy trình: mua ở trang Vật nuôi của cửa hàng (U xoay vòng 3 trang: cửa hàng, nâng cấp, vật nuôi) -> ra chuồng cho ăn (E, -2 năng lượng, dùng 1 thức ăn) -> chờ (chỉ tính khi đã ăn và game mở) -> nhặt (E, -2 năng lượng) -> bán trứng như nông sản. Bong bóng trên đầu vật nuôi: thức ăn khi đói, trứng khi có sản phẩm. Dữ liệu: src/data/animals.ts. Logic: G.buyAnimal, feedAnimal, collectProduct, animalReady, animalProgress; G.tick tính cả vật nuôi.
- Bước F xong (trang trí bản đồ): hàng rào, bụi cây, ao, đá, hoa, đèn đường (src/data/world.ts: DecorDef, farmDecor; art SVG trong tools/gen-art.mjs). Vật chặn đường: hàng rào, bụi cây, ao, đèn; hoa và đá chỉ để nhìn. Đèn đường có quầng sáng cộng màu từ 18:00 và đậm dần về đêm (nằm trên lớp phủ tối).
- Save version 6 (thêm animals theo chỗ trong chuồng). Đọc được bản 1-5 (chuồng trống). Chỗ vật nuôi mới thêm sau khi lưu được tạo trống. Vật nuôi sai (loài lạ, tiến độ vượt mức, chỗ trống đang ăn, chưa ăn mà có tiến độ) bị từ chối.
- Phát hiện nhờ xem ảnh: HUD (7 ô vật phẩm sau khi thêm thức ăn và trứng) che mất chuồng đặt ở góc trên-trái, kiểm thử số liệu không bắt được. Đã chuyển chuồng sang cột 8-13, thu nhỏ ô túi đồ từ 52 xuống 44 px, dời ao/cây/bụi, và thêm test chống tái diễn (tests/World.test.ts: đối tượng tương tác và hàng rào phải nằm ngoài vùng HUD; hằng số HUD_MAX_X/Y trong test khớp src/ui/Hud.ts, phải cập nhật nếu thêm vật phẩm vào catalog làm HUD rộng ra).
- Kiểm chứng: pnpm build; pnpm test 55/55 (thêm tests/Animals.test.ts 13 test và tests/World.test.ts 6 test gồm BFS xác nhận đường đi thông suốt từ xuất phát tới NPC/ô đất/cửa/chuồng); e2e 42/42 và e2e-extra 50/50 trong Edge headless, gửi phím thật: vật nuôi bị khóa rồi mua được gà ở cửa hàng, ra chuồng cho ăn, chờ, nhặt trứng, bấm lặp không nhân đôi, hết thức ăn không cho ăn được, hàng rào chặn đường, đèn đường sáng ban đêm. Đã xem ảnh sân vườn, chuồng, ban đêm.
- Chưa kiểm chứng: cân bằng kinh tế vật nuôi (giá, thời gian, giá trứng) và độ khó của chu trình cho ăn - nhặt; đi bộ thật đến chuồng và giữa chuồng với ô đất kề nhau (ưu tiên vật nuôi hệ số 0.9, chỉ kiểm bằng ảnh và vị trí cố định); nhiều hơn 3 vật phẩm có giá mua thì cửa hàng quá 5 phím; chưa có âm thanh riêng cho vật nuôi; nhân vật vật nuôi mới có một tư thế đứng nhún nhẹ, chưa có animation riêng.
- Lưu ý: chuồng và HUD chung vùng màn hình nhỏ; ở cửa sổ rất nhỏ HUD vẫn che một phần bản đồ phía trên-trái.
- Việc tiếp theo trong thứ tự đã thống nhất: G nhân vật và animation tự vẽ trong Krita (chủ dự án, AI hướng dẫn/review). Các hướng khác khi cần: nội thất trong nhà, thêm cây trồng, nhạc nền/âm thanh thật, ngoài ra là phát hành bản chơi đơn (giai đoạn 13) khi chủ dự án sẵn sàng.

### Mẫu cập nhật sau mỗi buổi
- Ngày:
- Mốc:
- Quyết định mới:
- File/asset đã thay đổi:
- Đã kiểm tra và kết quả:
- Chưa kiểm tra:
- Lỗi còn lại:
- Việc tiếp theo:


Cập nhật: 09/11/2026 (bỏ hệ thống năng lượng theo yêu cầu chủ dự án)
- Đã gỡ hoàn toàn năng lượng: không còn thanh năng lượng ở HUD, không tốn năng lượng khi trồng/tưới/thu hoạch/cho ăn/nhặt, không còn thông báo "quá mệt", bỏ nâng cấp Thể lực (còn Phân bón và Bình tưới lớn). Ngày/đêm, ngủ từ 18:00 và ánh sáng giữ nguyên.
- Save vẫn là version 6: trường `energy` và nâng cấp `stamina` trong save cũ được bỏ qua khi đọc (không bị từ chối).
- Kiểm chứng: pnpm build qua; pnpm test 51/51 (đã xóa các test năng lượng/thể lực, thêm test đọc save cũ còn energy); e2e 42/42; e2e-extra 49/49 (đã sửa các kiểm tra năng lượng). Chưa xem lại ảnh HUD sau khi bỏ thanh năng lượng.
- Các mục "năng lượng" trong nhật ký phía trên là lịch sử, không còn đúng với code hiện tại.

Cập nhật: 09/11/2026 (hướng "nông trại theo khu" lấy cảm hứng từ ảnh gameplay chủ dự án gửi; bước 1: mở rộng nông trại)
- Hướng mới đã chốt: 4 bước. 1) Bản đồ mở rộng được (XONG). 2) Nhà chế biến + nhà kho (kho giới hạn sức chứa, mua nâng cấp; chế biến chạy theo thời gian thật). 3) Chuồng nhiều loài (heo, bò). 4) Hồ cá (nuôi như ruộng: mua cá giống, chờ lớn, thu hoạch). Chỉ lấy cấu trúc chức năng làm cảm hứng, không sao chép hình/bố cục game gốc.
- Bước 1 xong: biển "MUA" ở rìa phải nông trại (ô cuối bản đồ, hàng 7); E mua cấp mở rộng: giá 400/900/1600, mỗi cấp thêm 4 cột và 9 ô đất (ID plot_e{cấp}_{i}_{j}). Bản đồ dài tới 32 cột; camera đi theo nhân vật theo chiều ngang khi rộng hơn 960 px. Dữ liệu: MapDef.expand, mapCols/maxMapCols, EXPAND_SIGN_ROW (src/data/world.ts); logic G.expansionCost/buyExpansion; PlotDef.expansion.
- Save version 7 (thêm expansion). Đọc được bản 1-6 (expansion = 0). expansion ngoài [0, số cấp] bị từ chối.
- Kiểm chứng: pnpm build qua; pnpm test 53/53 (thêm test mua mở rộng, save v7, BFS ở mọi cấp mở rộng gồm biển MUA đứng được); e2e 42/42; e2e-extra 56/56 (biển MUA, thiếu tiền, mua, 9 ô mới hiện, camera đi theo). Đã xem ảnh nông trại mở rộng.
- Chưa kiểm chứng: cân bằng giá mở rộng; vùng mới chưa có trang trí (chỉ cỏ); chưa chia khu rõ bằng hàng rào/đường (chuồng, ruộng, nhà, ao vẫn như cũ); mua mở rộng không có hộp xác nhận (hint hiện giá trước khi bấm E); cửa sổ nhỏ.
- Việc tiếp theo: bước 2 (nhà chế biến + nhà kho).

Cập nhật: 09/11/2026 (bước 2: nhà chế biến + nhà kho; thế giới cuộn bốn phía)
- Thế giới nông trại lớn hơn khung nhìn theo cả hai chiều: 28 x 25 ô (mở rộng tới 40 cột). Khu ruộng/chuồng/nhà cũ được dịch vào giữa (FARM_SHIFT = +8 cột, +8 hàng, hàm shiftMap trong src/data/world.ts) để đi tiếp ra bốn phía: trên là khu nhà bếp + nhà kho, trái và dưới là lề cây/bụi/hoa, phải là đất mở rộng. Camera đi theo nhân vật cả hai chiều, dừng ở mép bản đồ; chiều nào nhỏ hơn khung (nhà trong) thì căn giữa. Số đom đóm tỷ lệ với diện tích.
- Nhà bếp (src/data/recipes.ts): đứng ở ô dưới chính giữa (mũi tên vàng), E mở bảng; 3 công thức, một mẻ một lúc, chạy theo thời gian thật khi game mở: nước ép cà rốt (3 cà rốt, 25 giây, bán 110), sốt cà chua (2 cà chua, 30 giây, bán 200), trứng ốp la (2 trứng gà, 35 giây, bán 130). Nấu xong ra lấy bằng E. Logic: G.startCooking, collectCooked, kitchenReady, kitchenProgress; tick tính cả nhà bếp.
- Nhà kho: sức chứa túi đồ = 50 + 25 mỗi cấp (nâng cấp 'warehouse': 250/600/1200, cũng nằm ở trang Nâng cấp của cửa hàng); E ở nhà kho xem túi đồ và nâng cấp. Kho đầy thì thu hoạch, nhặt trứng, mua hàng, lấy thành phẩm đều bị từ chối ('full') mà không mất gì; HUD hiện "Kho x/y".
- Save version 8 (thêm kitchen). Đọc được bản 1-7; vị trí nhân vật ở nông trại trong save cũ được dịch theo FARM_SHIFT. Mẻ nấu sai (công thức lạ, tiến độ vượt) bị từ chối.
- Kiểm chứng: pnpm build qua; pnpm test 60/60 (thêm tests/Kitchen.test.ts 6 test, test thế giới lớn hơn khung và đi ra được bốn phía, BFS tới nhà bếp/kho ở mọi cấp mở rộng); e2e 42/42; e2e-extra 72/72 (đi lên/xuống/trái camera cuộn theo, camera dừng ở hai góc, nấu và lấy bằng phím thật, nâng cấp kho, kho đầy từ chối thu hoạch). Đã xem ảnh nhà bếp, góc dưới-phải, kho đầy. Các script e2e dùng OX/OY = 8 khớp FARM_SHIFT.
- Chưa kiểm chứng: cân bằng (sức chứa 50, giá nâng kho, thời gian và giá công thức); nhà bếp/kho nằm sát HUD khi camera ở mép trên (một phần mái bị HUD che); vùng lề mới chỉ có cây/bụi/hoa, chưa có nội dung chơi (ao cá để bước 4); mới cuộn bằng phím trong trình duyệt headless, chưa chơi tay trên máy thật; hiệu năng khi bản đồ lớn chưa đo.
- Việc tiếp theo: bước 3 (chuồng nhiều loài: heo, bò) rồi bước 4 (hồ cá) ở vùng lề bên trái.

Cập nhật: 09/11/2026 (bước 3: chuồng nhiều loài)
- Thêm heo (450 tiền, 100 giây, nấm cục bán 130) và bò (800 tiền, 140 giây, sữa bò bán 220), mở khóa sau đơn "Mở rộng vườn" (big_garden). Dữ liệu: src/data/animals.ts; vật phẩm mới truffle, milk trong ITEMS (HUD thu ô túi đồ 44 -> 40 px, khe 6 -> 4 để 12 ô vẫn vừa). Mua ở trang Vật nuôi (phím 1-4). Thứ tự giá/thời gian/lời theo giây tăng dần gà < vịt < heo < bò (có test).
- Chuồng mở rộng thành 8 chỗ: hàng 0 (pen_0..3) và hàng 2 (pen_4..7), hàng 1 ở giữa là lối đi; thêm hàng rào ngang phía trên. Chỗ cũ giữ ID (save v8 vẫn đọc được, chỗ mới mặc định trống).
- Kiểm chứng: pnpm build qua; pnpm test 62/62 (thêm 2 test: heo/bò khóa-mở-mua-nhặt, thứ tự kinh tế); e2e 42/42; e2e-extra 76/76 (mua heo, bò bằng phím thật ở trang Vật nuôi, heo hiện đúng hình). Đã xem ảnh chuồng. Lưu ý: một lần chạy e2e-extra có 7 lỗi ở đoạn cho gà ăn rồi chạy lại qua 76/76 — nghi nhiễu vị trí đi bộ trong trình duyệt headless (chưa tìm nguyên nhân cụ thể); chạy e2e.mjs trước để reset save rồi mới chạy e2e-extra.
- Chưa kiểm chứng: cân bằng giá/thời gian/sản phẩm; chưa có công thức dùng sữa hay nấm cục ở nhà bếp; hình heo/bò là SVG tạm; cho ăn từng con một (8 con tốn nhiều thao tác) chưa được cảm nhận bằng tay.
- Việc tiếp theo: bước 4 hồ cá ở vùng lề bên trái.

Cập nhật: 09/11/2026 (bước 4: hồ cá — hoàn thành 4 bước của hướng "nông trại theo khu")
- Hồ cá ở lề trái (cột 2-5, hàng 11-12 theo tọa độ cuối): 8 ô nước (PlotDef.kind = 'pond', ID pond_i_j), mở khóa sau đơn "Cà chua cho bữa tiệc" cùng vật nuôi. Ô nước chặn đường (đứng ở ô kề); nuôi như ruộng nhưng không cần tưới: Cá giống (35 tiền) thả bằng E, cá lớn sau 50 giây (chịu cả phân bón), E vớt ra Cá (bán 110). Cá giống chỉ thả ở ao, hạt giống chỉ trồng ở ruộng ('wrong-place', không mất hạt). CropDef có thêm seedArt/sproutArt/habitat. Không đổi cấu trúc save (vẫn v8; ô nước thiếu trong save cũ mặc định trống).
- HUD thu ô túi đồ xuống 36 px, khe 3 để 14 ô vẫn vừa (~295 px).
- Kiểm chứng: pnpm build qua; pnpm test 66/66 (thêm 4 test cá + BFS ô nước đứng được cạnh); e2e 42/42; e2e-extra 84/84 (ao chặn đường, cà rốt bị từ chối ở ao, thả cá, không cần tưới, vớt cá). Đã xem ảnh ao. Đã tăng thời gian giữ phím trong tap() của e2e-extra (80 -> 160 ms) vì bản đồ lớn làm trình duyệt headless chạy chậm, đôi lần bỏ sót phím E. Dev server từng tự tắt giữa phiên chạy nên có vài lần chạy lỗi giả: cần kiểm tra `curl localhost:5173` trước khi chạy e2e.
- Chưa kiểm chứng: cân bằng (giá cá giống, 50 giây, giá cá 110); ao chỉ có một loài cá; chưa có công thức nấu cho cá/sữa/nấm cục; hình cá là SVG tạm; chơi tay thật.
- Việc tiếp theo gợi ý: công thức nhà bếp cho cá/sữa/nấm cục, nhiều loài cá; bước G (tự vẽ nhân vật/art trong Krita); âm thanh/nhạc thật; phát hành bản chơi đơn (giai đoạn 13) khi sẵn sàng.

Cập nhật: 09/11/2026 (thiết kế lại bố cục nông trại theo ảnh tham khảo mới của chủ dự án — thay thế các mục bố cục/mở rộng/FARM_SHIFT ở trên)
- Yêu cầu của chủ dự án: khung hình giống game tham khảo; CHỈ mở rộng trái-phải (không cuộn lên/xuống); thứ tự từ trái sang phải: khu chăn nuôi, nhà bếp, nhà kho, khu trồng trọt, hồ cá; hồ cá có sẵn không cần nhiệm vụ; xóa vùng nước cũ; có biển mua mở rộng cho từng khu.
- Đã làm: nông trại là dải ngang 11 hàng (528 px, thấp hơn màn hình nên không cuộn dọc), chiều dài thay đổi theo cấp các khu. Hàng 0-1 bầu trời + đồi, hàng 2 cây lớn, hàng 3-4 nhà/nhà bếp/nhà kho, hàng 4-6 chuồng/ruộng/ao, hàng 7 lối đi, hàng 8-9 đường đất, hàng 10 hàng rào. Từ trái sang phải: nhà + người bán hàng (khu xuất phát, thêm ngoài danh sách của chủ dự án), chuồng, nhà bếp, nhà kho, ruộng, hồ cá. Bố cục sinh bằng farmLayout(zones) trong src/data/world.ts; getMap(id, zones) dùng khi chơi; MAPS.farm là cấp 0.
- Mở rộng từng khu bằng biển "MUA" ngay bên phải khu (đứng ở ô bên phải biển, E): chuồng +2 cột (thêm 4 chỗ, 2 hàng) giá 300/700/1200; ruộng +3 cột (9 ô) 400/900/1600; hồ cá +2 cột (6 ô nước) 300/700/1200. Các khu phía sau tự dịch sang phải. Logic G.zoneCost/buyZone/penCapacity; dữ liệu ZONES. Nhà bếp và nhà kho CHƯA có biển mở rộng riêng (nhà kho có nâng cấp sức chứa trong bảng của nó; nhà bếp chưa có mở rộng).
- Hồ cá: có sẵn, ô nước đi qua được (đứng trên ao), cá giống mua từ đầu không cần đơn hàng. Vùng nước cũ (ao 4x2 ở lề trái, ao trang trí) đã xóa.
- Camera chỉ đi theo ngang; nền có dải bầu trời + đồi + mây vẽ bằng hình đơn giản.
- Save version 9: `expansion` đổi thành `zones` {pen, field, pond}; bản 7-8 giữ cấp ruộng, các khu khác 0; save cũ ở nông trại: vị trí nhân vật về điểm xuất phát. ID ô đất ruộng/ao/chỗ chuồng giữ nguyên quy ước, chỗ mới mặc định trống.
- Kiểm chứng: pnpm build qua; pnpm test 71/71 (viết lại tests/World.test.ts: thứ tự khu, dải một màn hình, số ô theo cấp, biển MUA, BFS mọi cấp; thêm test mở rộng khu, chuồng theo cấp, save v9); e2e 42/42; e2e-extra 90/90 (mua mở rộng chuồng/ruộng/ao bằng phím thật, camera chỉ cuộn ngang và dừng ở hai đầu, nhà bếp/kho, ao có sẵn). Đã xem ảnh bắt đầu, nhà bếp, đầu phải bản đồ. Phím cửa hàng đổi vì cá giống mua từ đầu: bán = 3, giao đơn = 4 lúc đầu.
- Chưa kiểm chứng: dải bầu trời mỏng (chỉ 2 hàng, phần lớn bị đồi và cây che) so với ảnh tham khảo; nhà bếp/kho chưa mở rộng được; cân bằng giá mở rộng; chơi tay thật; hiệu năng với bản đồ dài tối đa.

Cập nhật: 09/11/2026 (nhà bếp/nhà kho có biển mở rộng, bầu trời cao hơn, công thức cho cá/sữa/nấm cục)
- Biển MUA cho nhà bếp và nhà kho (ZONES.kitchen, ZONES.warehouse): đặt ngay bên phải công trình, mở rộng công năng, KHÔNG làm dài bản đồ. Nhà bếp: +1 mẻ nấu cùng lúc mỗi cấp (350/900; tối đa 3 mẻ; KITCHEN_MAX_SLOTS), mẻ chạy độc lập, E lấy mẻ chín trước, bảng nấu vẫn mở khi còn bếp trống. Nhà kho: +25 sức chứa mỗi cấp (250/600/1200), sức chứa = 50 + 25 * zones.warehouse (bỏ nâng cấp 'warehouse' cũ ở trang Nâng cấp). Có thể mua ở biển hoặc trong bảng nhà kho. Khoảng cách giữa nhà kho và ruộng tăng thêm 1 ô để ô đứng mua không tranh mục tiêu E với ô đất.
- Bầu trời cao hơn (4 hàng trời/đồi trên cùng, bố cục các khu dời xuống 1 hàng: nhà/nhà bếp/nhà kho hàng 4-5, khu chuồng/ruộng/ao hàng 5-7, biển MUA hàng 6, đường đất hàng 8-9): nền trời xanh, mây, đồi thấp, hàng cây nhỏ ở xa dọc đường chân trời, vài cây lớn (tán cao vượt lên trời, 1 cây mỗi 9 cột). Đã kiểm điểm ảnh: trời xanh (111,195,242) hiển thị ở trên cùng.
- Công thức mới (nhà bếp có 6 công thức, phím 1-6): súp cá (2 cá, 40 giây, bán 340), phô mai (2 sữa bò, 50 giây, bán 600), nấm cục hầm (2 nấm cục, 45 giây, bán 380); đều lời hơn bán nguyên liệu (có test). HUD thu ô túi đồ xuống 30 px để vừa 20 ô.
- Save version 10: zones thêm kitchen và warehouse; kitchen thành mảng 3 mẻ; save bản 8-9 đổi tự động (kitchen 1 mẻ vào ô 0; nâng cấp 'warehouse' cũ thành zones.warehouse). Mẻ nấu nằm ở ô chưa mở bị từ chối.
- Kiểm chứng: pnpm build qua; pnpm test 73/73 (viết lại test nhà bếp nhiều mẻ, save v10, công thức cá/sữa/nấm, bố cục 5 biển MUA); e2e 42/42; e2e-extra 99/99 (mua mở rộng nhà bếp/nhà kho bằng biển, nấu 2 mẻ cùng lúc bằng phím thật, phô mai và súp cá, camera chỉ cuộn ngang). Đã xem ảnh nhà bếp, ao, bắt đầu.
- Chưa kiểm chứng: so với ảnh tham khảo bầu trời vẫn thấp hơn một chút và cây/đồi vẽ bằng hình đơn giản; cân bằng giá/thời gian công thức và mở rộng; hình các món mới là SVG tạm; chơi tay thật; nhà bếp chỉ hiện trạng thái các mẻ trong bảng/gợi ý, chưa có hoạt ảnh nấu.

Cập nhật: 10/11/2026 (dùng asset pixel-art chủ dự án thêm vào public/assets)
- Chủ dự án thêm 5 gói asset miễn phí. ĐÃ ĐỌC GIẤY PHÉP: tất cả chỉ cho dự án PHI THƯƠNG MẠI, cấm phân phối lại gói gốc; Little Dreamyland, Sprout Lands bắt buộc ghi công; Super Retro Ranch mong ghi công "Gif" và mã hóa asset khi đăng web; gói Farm RPG FREE 16x16 KHÔNG kèm giấy phép (chưa xác minh). Chi tiết ở CREDITS.md. Hệ quả: không bán/kiếm tiền được cho đến khi thay bằng hình tự vẽ hoặc mua giấy phép; cần quyết định trước giai đoạn 13 (phát hành).
- Đã dời 5 gói gốc ra art-source/third-party/ (đã .gitignore) để không bị đóng gói vào bản build; chỉ các ảnh đã dùng được copy vào public/assets/px/.
- Cơ chế: src/pixelart.ts nạp ảnh gốc rồi "nướng" từng phần (cắt + phóng nguyên/gần nguyên, không làm mờ) thành texture canvas, thay texture SVG tạm cùng khóa; muốn thay một hình bằng bản tự vẽ chỉ cần bỏ dòng tương ứng ở BAKES. Đã thay: cỏ, đường đất, ô đất khô/ướt (ướt = phủ tối), ô nước, cây cà rốt/cà chua 3 giai đoạn (cà chua cao gấp đôi ô), cây lớn, cây nhỏ ở chân trời, nhà (Cute Fantasy), nhà bếp/nhà kho (nhà Farm RPG), hàng rào, đèn, đá, hoa, gà/vịt(gà con)/heo/bò, icon cà rốt/cà chua/trứng/sữa, nhân vật 3 hướng 6 frame đi bộ (Farm RPG), người bán hàng là thỏ. Còn là SVG tạm: hạt giống, cá, icon thành phẩm nấu, biển MUA, giường, sàn/tường trong nhà, icon tiền/thức ăn.
- Thay đổi code: nhân vật 96x96 (neo chân 0.9), cây neo đáy ô và cao theo tỷ lệ ảnh, đường là tileSprite, vật nuôi có size riêng (AnimalDef.size), CROPS có seedArt/sproutArt riêng mỗi cây.
- Kiểm chứng: pnpm build qua; pnpm test 73/73; e2e 42/42; e2e-extra 99/99 (đã đổi khóa texture mầm cà chua); đã xem ảnh bắt đầu, cây trồng, chuồng với bò/heo/gà/vịt, đi trái/phải.
- Chưa kiểm chứng: hướng nhìn của hình 'side' (hình gốc là 3/4 nên khó phân biệt trái/phải); phong cách lẫn nhiều gói (16px và 32px) có thể chưa đồng nhất; hình cá/icon thành phẩm còn SVG nên lệch phong cách; chưa chơi tay.

Cập nhật: 10/11/2026 (giao diện gần với ảnh tham khảo của chủ dự án)
- HUD viết lại (src/ui/Hud.ts): góc trên-trái có nút menu (trắng, ba vạch xanh) mở túi đồ và nút thư (đơn hàng, chấm đỏ "!" khi đã đủ hàng để giao); góc trên-phải có hai viên thuốc "Ngày/giờ" và tiền; góc dưới-trái có nút "Xong" màu vàng hiện khi đang mở bảng hoặc túi đồ; chip hạt đang chọn dưới hai nút. Túi đồ là lưới ô mở bằng nút menu hoặc phím I (ESC đóng), bấm vào hạt để chọn hạt. Bấm chuột hoạt động cho các nút này (game vẫn chơi bằng bàn phím).
- Mũi tên vàng nhấp nhô trên đối tượng đang ngắm (ô đất, vật nuôi, người bán hàng, biển MUA) và thanh tiến độ trên ô đang lớn (biểu tượng sản phẩm, "N giây" còn lại hoặc "Cần tưới", thanh tiến độ).
- Giữ nguyên các thuộc tính e2e dùng (hud.slots, coinText, clockText, selectedText). Nút thư mở bảng đơn hàng; hướng dẫn (H) đã cập nhật.
- Kiểm chứng: pnpm build qua; pnpm test 73/73; e2e 42/42; e2e-extra 106/106 (thêm kiểm tra bấm chuột thật: nút menu, chọn hạt, nút thư, nút Xong, phím I/ESC). Đã xem ảnh túi đồ, cửa hàng, cây đang lớn, nhà bếp.
- Chưa kiểm chứng: so với ảnh tham khảo còn thiếu: thẻ tên người chơi trên đầu, hộp tin nhắn kiểu game gốc; chữ vẫn là font hệ thống; chưa chơi tay; trên màn hình cảm ứng chưa thử.

Cập nhật: 10/11/2026 (chỉnh bố cục/phối cảnh theo ảnh ghép toàn nông trại của chủ dự án)
- Nền đổi theo ảnh: đất là nền chung, cỏ phủ thành các "lô" (MapDef.lots): dải sau nhà/nhà bếp/nhà kho, lô nhà, lô ruộng, lô hồ cá; chuồng giữ nền đất; tường đá + hàng hoa chạy dọc dưới cùng (MapDef.wallRow, thay hàng rào dưới); cây lớn lá mùa thu (cam, đỏ, vàng: bake từ cây sồi bằng hue-rotate, giữ màu thân cây) dày hơn; thẻ tên gỗ "Nông dân" trên đầu nhân vật.
- Kiểm chứng: pnpm build qua; pnpm test 73/73; e2e 42/42; e2e-extra 106/106; đã xem ảnh bắt đầu, cây đang lớn, nhà bếp.
- Chưa giống ảnh: không có rơm khô và lúa vàng ở rìa, đồi xa/cây xa nhạt màu, mây, cây lớn hai đầu trái-phải cắt ngang; hình pixel-art khác phong cách cartoon mượt của ảnh; thẻ tên mới là mẫu cố định; lô cỏ chưa có hàng cây hoa viền như ảnh; chưa chơi tay.

Cập nhật: 10/11/2026 (không để chạy ngầm)
- Chủ dự án yêu cầu không để dev server/Edge headless chạy ngầm (làm lag máy). Đã thêm `pnpm e2e` (tools/run-e2e.mjs): tự mở dev server + Edge headless, chạy e2e.mjs và e2e-extra.mjs, rồi luôn tắt cả cây tiến trình (kể cả khi lỗi/Ctrl+C). Không có cấu hình tự chạy (không có .vscode/tasks nào). Đã chạy thử: 42/42 và 106/106, sau đó cổng 5173 và 9222 đóng, không còn tiến trình Edge nào.
- e2e-extra chờ chuyển bản đồ bằng vòng kiểm tra (waitMap) thay vì sleep cố định vì máy/profile mới chạy chậm hơn.

Cập nhật: 10/11/2026 (kiểm tra sprite so với ảnh tham khảo và sửa các lỗi hình rõ nhất)
- Lỗi thấy khi xem ảnh 1920x1080: bóng đổ có sẵn trong ảnh cây hiện thành vệt tối to trên trời/đồi; thân cây lá mùa thu bị tím do hue-rotate; cỏ tối và phẳng; đất cam gắt; hồ cá là khối xanh phẳng.
- Đã sửa (src/pixelart.ts, PlayScene): xóa pixel bán trong suốt (bóng) của cây; đổi sắc CHỈ pixel xanh lá bằng HSL (thân nâu giữ nguyên) cho cây cam/đỏ/vàng; cỏ sáng hơn, đất nhạt hơn, nước dịu hơn; rải cỏ dại/hoa nhỏ trên lô cỏ; hồ cá có viền bờ xanh, viền sáng và lá sen.
- Kiểm chứng: pnpm build; pnpm test 73/73; pnpm e2e 42/42 và 106/106 (đã tự tắt); đã xem ảnh 1920x1080 và ảnh hồ cá.
- Vẫn khác ảnh tham khảo: nét vẽ pixel-art so với cartoon mượt có chiều sâu đổ bóng; ô đất là khối vuông liền nhau thay vì ô nhỏ có viền đá; nền cỏ/đất ít hoa văn; tán cây có kết cấu pixel thô khi phóng to; chữ hệ thống. Muốn giống hơn nữa cần hình tự vẽ hoặc gói asset cartoon.

Cập nhật: 10/11/2026 (tích hợp gói vectoraith 48x48 sau khi chủ dự án xác nhận giấy phép)
- Chủ dự án thêm nhiều gói vào art-source/third-party (Sunnyside, Kenney Tiny Farm/Town/UI, PixelUI, Bloomseed, vectoraith, ...). Đã xem: vectoraith (48x48, bằng đúng kích thước ô, có đất/cỏ lô bo góc, nhà, nhà kho, rơm, đèn, hàng rào, cây lớn cam/hồng/xanh, nhân vật 4 hướng, bò, gà) là gói gần ảnh tham khảo nhất; Kenney (CC0) hợp cho khung giao diện và dùng thương mại được; crops-v2.1 là CC-BY-SA/GPL (tránh); stardew_farm_assets nghi lấy từ Stardew (không dùng). Chủ dự án đã xác nhận giấy phép vectoraith.
- Đã dùng vectoraith cho: nhân vật (48x96, 4 hướng thật, hình đi ngang lật khi đi sang trái), bò, gà, gà con (làm vịt con), nhà ở (nhà mái cam, rộng 5 ô), nhà bếp (nhà mái xanh, 5 ô), nhà kho (nhà mái nâu, 4 ô), đống rơm (decor mới 'hay'), đèn, hàng rào gỗ, hoa, đá, cây lớn (cam/hồng/xanh, phóng 2x), cây trồng cà rốt/cà chua, ô đất khô/ướt, cỏ, đất, ô nước. Bố cục các khu rộng hơn (kitchen/warehouse rộng hơn, khoảng cách mới; plot_0_1 ở cột 31). Còn dùng Cute Fantasy/Farm RPG cho heo, thỏ, cây nhỏ xa, cỏ dại, icon.
- Chưa làm: ghép lô cỏ/đất/ao bằng các mảnh bo góc của vectoraith (đang là khối vuông phủ nền), khung giao diện Kenney UI, nhiều ảnh trong gói chưa dùng (cừu, dê, bê, silo, nhà kho đỏ, mùa khác).
- Sự cố đã xử lý: dev server khởi động chậm vì Vite theo dõi cả art-source (hàng nghìn ảnh) → thêm vite.config.ts bỏ qua art-source/docs/tools/tests. Test e2e NPC chống đi quá (máy chậm).
- Kiểm chứng: pnpm build; pnpm test 73/73; pnpm e2e 42/42 và 106/106 (đã tự tắt); đã xem ảnh bắt đầu, chuồng, 1920x1080.

Cập nhật: 10/11/2026 (bắt đầu chuyển sang PNG kiểu tranh sơn do script sinh)
- Thêm `pnpm art` (tools/gen-png.mjs + tools/png-painter.js): mở Edge headless riêng (cổng 9223), vẽ bằng canvas 2D rồi lưu PNG vào public/assets/png/, luôn tự tắt Edge. Hình có bóng mềm, ánh sáng trên-trái, kết cấu hạt, viền đá, lá chồng nhiều lớp.
- Giai đoạn 1 xong (11 ảnh, gấp đôi kích thước hiển thị): cỏ, đất (ô lát 192 px), ô đất khô/ướt (khung đá, luống), nước, cây lớn cam/đỏ/vàng/xanh, cây vừa, cây nhỏ. BootScene nạp các khóa này bằng load.image; ô lát cỏ/đất dùng setTileScale(TILE/192).
- Chưa chuyển (vẫn SVG phẳng hơn nên lệch phong cách): nhà ở/nhà bếp/nhà kho, cây trồng, trang trí (đèn, hàng rào, hoa, rơm, đá), nhân vật, người bán hàng, vật nuôi, icon.
- Kiểm chứng: pnpm art tạo 11 ảnh và tự tắt Edge; pnpm build; pnpm test 73/73; pnpm e2e 42/42 và 106/106; đã xem ảnh 1920x1080 và nhà bếp.

Cập nhật: 10/11/2026 (chuyển TOÀN BỘ hình sang PNG kiểu tranh sơn; xóa SVG)
- Đã xóa mọi file SVG (public/assets/sprites, favicon.svg, icons.svg) và các script SVG cũ (tools/gen-art.mjs, gen-cartoon.mjs, gen-placeholder-tiles.mjs, tilesets cũ). Favicon là public/favicon.png.
- `pnpm art` (tools/gen-png.mjs; mã vẽ canvas ở tools/png-painter.js và tools/paint/{lib,plants,buildings,decor,animals,characters,icons}.js) tạo 66 ảnh PNG trong public/assets/png/, luôn tự tắt Edge (cổng 9223). Gồm: cỏ/đất/sàn/tường (ô lát 192), ô đất/nước, cây trồng và cá (9), cây (6), nhà ở/bếp/kho, giường, trang trí (16), vật nuôi (4), nhân vật + người bán hàng, icon (18).
- BootScene nạp tất cả bằng load.image; ô lát dùng setTileScale(TILE/192). Hình có gradient, viền tối nhẹ, bóng đổ mềm, ánh sáng trên-trái, kết cấu hạt.
- Kiểm chứng: pnpm art ghi 66 ảnh và tự tắt; pnpm build; pnpm test 73/73; pnpm e2e 42/42 và 106/106; đã xem ảnh bắt đầu, chuồng, nhà bếp.
- Chưa tốt: người bán hàng và nhân vật còn hơi hoạt hình đơn giản; vật nuôi/icon vẽ nhanh; nhiều hình chưa tinh chỉnh tỷ lệ; chưa chơi tay.

Cập nhật: 11/11/2026 (làm lại toàn bộ giao diện theo hai ảnh tham khảo + bộ pixel-art mới trong art-source)
- Chủ dự án gửi ảnh khu chợ (menu, thư, lái buôn, rương, cổng FARM, bảng tin, cửa hàng, quầy trái cây) và ảnh ghép nông trại, kèm bộ pixel-art mới (art-source/). Đã làm lại hình theo đó:
  - `tools/import-art.mjs` (`pnpm art`): chép 211 ảnh từ art-source/ vào public/assets/game/ (khóa phẳng) và sinh src/assets.gen.ts. Đã xóa pipeline tranh sơn cũ (tools/gen-png.mjs, png-painter.js, paint/*, public/assets/png).
  - Bản đồ (src/data/world.ts): TILE = 32; nông trại cố định 54x17 ô (vừa đúng một màn hình cao 544 px, cuộn ngang; mở rộng KHÔNG làm bản đồ dài ra nữa mà thêm chỗ nuôi/ô đất ở lô kế tiếp/hàng ô nước); thêm khu chợ 30x17 (lái buôn, rương, cổng FARM, bảng tin, cửa hàng, quầy); game bắt đầu ở khu chợ (START_MAP = 'hub'). Đã bỏ nhà ở/giường/ngủ (G.sleep còn trong logic nhưng không còn UI). Ao tối đa 2 cấp mở rộng (trước 3).
  - Vẽ: src/scenes/MapView.ts (phông trời, cây xa, nền đất/cỏ, lô cỏ viền bo 3x3, hồ 3x3, hàng rào chuồng, công trình, tường đá + hoa, biển MUA...), BootScene nạp atlas 'env' + ảnh khóa phẳng và nướng icon hạt giống/trứng vịt, src/art.ts (hằng số, animation), Hud dùng sprite (nút menu, thư + dấu báo, nút Xong vàng, viên tiền/giờ, ô túi đồ), nhân vật mới, cây 4 giai đoạn, vật nuôi idle 2 frame, mũi tên/tên bằng sprite UI.
  - Save v11: bản cũ về điểm xuất phát của bản đồ; map 'house' cũ chuyển sang 'hub'; cấp ao vượt mức bị kẹp.
  - Màn hình game đổi 960x544 (17 ô x 32 px).
- Kiểm chứng: pnpm build; pnpm test 72/72; pnpm e2e 44/44 và 102/102 (tự tắt dev server/Edge, cổng 5173/9222 đóng); đã xem ảnh khu chợ, chuồng/nhà bếp/nhà kho, ruộng, hồ cá. tools/run-e2e.mjs có thêm E2E_SCRIPTS để chạy kịch bản khác.
- Chưa làm / lưu ý: chưa chơi tay; chữ trong bảng cửa hàng/bếp vẫn là bảng chữ thô (chưa dùng khung UI mới); hình nhìn ngang của nhân vật chưa kiểm hướng mặt ở mọi frame; bộ art rất giống ảnh tham khảo nên CẦN chủ dự án xác nhận quyền sử dụng (ghi trong CREDITS.md).

Cập nhật: 11/11/2026 (cửa hàng/kho/bếp bằng khung gỗ; hồ có hàng rào; gà vịt thả rông; mở khóa theo cấp; tiền khởi đầu lớn)
- Giao diện: src/ui/ShopUI.ts vẽ cửa sổ gỗ + tab + lưới ô + nút vàng cho cửa hàng (5 tab: Giống, Vật nuôi, Vật phẩm, Kho hàng, Kho), nhà kho (tab Kho) và nhà bếp (tab Nhà bếp); PlayScene dựng ShopModel (shopEntries/shopModel). Điều khiển bàn phím: ←→/AD đổi tab hoặc chọn ô, ↓/S xuống lưới, ↑/W lên tab, Enter nút chính, F nút phụ; chuột vẫn dùng được. Phím tắt số/U cũ giữ nguyên (chữ vẫn ghi vào panel.text cho kiểm thử).
- Hồ cá: sân có hàng rào gỗ (cổng bên trái), mặt nước 3x4 chặn đường, thả/vớt cá từ bờ (tầm với 2.3 ô).
- Luật mới: bỏ mở khóa bằng đơn hàng. Điều kiện nằm ở `unlock: { zone, level }` của ITEMS/ANIMALS/PlotDef (xem unlockMet/unlockText ở world.ts): cà chua ruộng 1; thức ăn + gà chăn nuôi 1; vịt + heo 2; bò 3; hàng ô đất thứ ba ruộng 1. Đơn hàng giữ lại, chỉ thưởng tiền.
- Gà, vịt thả rông (chỗ `free_k`, 3 chỗ + 3 mỗi cấp chăn nuôi, trên bãi cỏ cạnh nhà bếp/nhà kho, đi lại ngẫu nhiên); heo, bò ở chuồng (`pen_k`). AnimalDef.home = 'free' | 'pen'.
- Save v12: save cũ được tặng thêm START_MONEY (100000) một lần; gà/vịt đang ở chuồng chuyển ra chỗ thả rông (hết chỗ thì hoàn tiền); gà/vịt ở chuồng hoặc heo/bò ở bãi thả rông bị từ chối. START_MONEY = 100_000 là tiền thử nghiệm, đặt lại khi cân bằng game.
- Kiểm chứng: pnpm build; pnpm test 75/75; pnpm e2e 45/45 và 115/115 (thêm kịch bản phím A/D/W/S, mũi tên, Enter); đã xem ảnh bãi thả rông và cửa hàng. Cổng 5173/9222 đóng sau khi chạy.
- Chưa kiểm chứng: chơi tay; cân bằng giá vì tiền đã rất nhiều; vật nuôi thả rông chỉ đi trong ±0,75 ô quanh chỗ ở.
