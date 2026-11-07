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
- [x] Chọn Piskel hoặc Aseprite (Piskel).
- [ ] Tạo dự án và Git.
- [ ] Prototype di chuyển và va chạm.
- [ ] Chốt art guide.
- [ ] Nhân vật và animation.
- [ ] Bản đồ.
- [ ] NPC và tương tác.
- [ ] Inventory.
- [ ] Vòng chơi nông trại.
- [ ] Save/load.
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

### Mẫu cập nhật sau mỗi buổi
- Ngày:
- Mốc:
- Quyết định mới:
- File/asset đã thay đổi:
- Đã kiểm tra và kết quả:
- Chưa kiểm tra:
- Lỗi còn lại:
- Việc tiếp theo:

