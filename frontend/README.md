# IUDrive - Frontend

Giao diện website thuê xe (khách hàng + trang quản trị). Công nghệ: **React 19 + Vite + Tailwind CSS 4 + React Router + Recharts + lucide-react**.

## Chạy dự án

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build    # build production vào dist/
```

Cần Node.js 20 trở lên.

## Tài khoản dùng thử (dữ liệu giả lập)

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Khách hàng | user@demo.com | user123 |
| Quản trị | admin@iudrive.vn | admin123 |

## Tính năng

**Khách hàng:** trang chủ, tìm xe theo địa điểm/ngày/loại xe, danh sách xe có bộ lọc (hãng, giá, số chỗ 4/7/16/29-30/45-50, nhiên liệu, hộp số, màu, tự lái/có tài xế), chi tiết xe, đặt xe (dịch vụ thêm, mã giảm giá, thanh toán giả lập), so sánh tối đa 3 xe, yêu thích, đánh giá, hồ sơ, lịch sử đơn thuê (hủy đơn), FAQ, liên hệ, giới thiệu.

**Quản trị (`/admin`):** tổng quan + biểu đồ, quản lý xe (thêm/sửa/xóa), đơn thuê (duyệt, bắt đầu, hoàn thành, hủy, phân công tài xế), khách hàng (khóa/mở khóa), tài xế, mã giảm giá.

**Chung:** Light/Dark mode, song ngữ Việt/Anh, responsive, validate form.

## Cấu trúc

```
src/
  components/   component dùng chung (CarCard, CarImage, Navbar, ui/...)
  context/      Theme, I18n, Toast, Store (dữ liệu), Auth
  data/         constants (hãng, màu, trạng thái...), seed (dữ liệu mẫu), content (FAQ...)
  layouts/      PublicLayout, AdminLayout
  lib/          format (tiền, ngày), pricing (tính giá, mã giảm giá)
  pages/        các trang khách; pages/admin cho quản trị
```

## Nối với Backend Spring Boot

Hiện tại dữ liệu là **mock**, lưu trong `localStorage` (khóa `rc_db_v2`), nằm ở `src/context/StoreContext.jsx` và `src/data/seed.js`. Các trang chỉ gọi `useStore()` / `useAuth()` nên khi BE sẵn sàng bạn chỉ cần thay thân các hàm trong hai file context này bằng lời gọi `fetch`/`axios` tới `/api/...`.

`vite.config.js` đã cấu hình proxy `/api` tới `http://localhost:8080`, nên khi dev không bị lỗi CORS.

Danh sách API, mô hình dữ liệu và quy tắc nghiệp vụ: xem [`docs/API.md`](docs/API.md). Lớp gọi API đã viết sẵn ở `src/services/` (`http.js`, `api.js`) nhưng **chưa nối vào giao diện**: khi BE xong cần cho `StoreContext`/`AuthContext` gọi các hàm này và thêm trạng thái đang tải/lỗi cho các trang.

## Ghi chú

- Ảnh xe nằm ở `public/cars/` (c1.jpg đến c24.jpg), lấy từ Wikimedia Commons (CC BY-SA 4.0 / CC0), nguồn tác giả ở `src/data/imageCredits.json` và trang `/credits`. Ảnh chỉ mang tính minh họa. Muốn đổi ảnh, thay file cùng tên hoặc sửa trường `image` trong `src/data/seed.js`. Xe không có ảnh sẽ hiện hình vẽ SVG (`CarImage.jsx`).
- Nếu dùng lại ảnh khi nộp bài, giữ trang Nguồn ảnh để đúng yêu cầu ghi tác giả của giấy phép CC BY-SA.
- Song ngữ: dùng `t('Tiếng Việt', 'English')` và `l({ vi, en })` từ `useI18n()`.
- Nút "Đặt lại dữ liệu mẫu" ở trang tổng quan admin sẽ khôi phục toàn bộ dữ liệu giả.
