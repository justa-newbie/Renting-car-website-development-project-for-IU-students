# API mà Frontend cần (gửi bạn làm Backend)

Đây là **bản đề xuất** dựa trên giao diện đã làm. BE muốn đổi tên trường hay đường dẫn thì báo FE để chốt trước khi code.

## 1. Quy ước chung

- Đường dẫn gốc: `/api` (BE chạy cổng `8080`; khi dev, Vite tự chuyển tiếp nên không cần CORS).
- Dữ liệu JSON, tên trường **camelCase**.
- Ngày: chuỗi `YYYY-MM-DD`. Tiền: số nguyên VND (ví dụ `650000`).
- `id` là chuỗi hoặc số đều được, miễn nhất quán.
- Đăng nhập bằng JWT: FE gửi `Authorization: Bearer <token>`.
- Cột **Quyền**: `Công khai`, `User` (đã đăng nhập), `Admin`.

Khi lỗi, trả đúng mã HTTP và body:

```json
{ "code": "CAR_NOT_AVAILABLE", "message": "Xe không còn trống trong khoảng ngày này" }
```

| HTTP | Khi nào |
|---|---|
| 400 | Dữ liệu không hợp lệ |
| 401 | Chưa đăng nhập hoặc token hết hạn |
| 403 | Không đủ quyền, tài khoản bị khóa (`ACCOUNT_BLOCKED`) |
| 404 | Không tìm thấy |
| 409 | Trùng dữ liệu (`EMAIL_EXISTS`, `CAR_NOT_AVAILABLE`, `CODE_EXISTS`) |

API trả danh sách: trả thẳng mảng. Nếu BE muốn phân trang thì thống nhất dạng `{ "items": [], "total": 0, "page": 1 }`.

## 2. Mô hình dữ liệu

### Car

```json
{
  "id": "c1", "brand": "Toyota", "model": "Vios", "year": 2023,
  "seats": 4, "type": "sedan", "color": "white",
  "fuel": "gasoline", "transmission": "auto",
  "pricePerDay": 650000, "driverOnly": false, "driverFee": 400000,
  "deposit": 3000000, "kmLimit": 300,
  "city": "Hà Nội", "plate": "30A-123.45", "status": "active",
  "features": ["bluetooth", "camera"], "isNew": false,
  "image": "/cars/c1.jpg", "createdAt": "2026-05-10",
  "ratingAvg": 4.8, "ratingCount": 5
}
```

| Trường | Giá trị |
|---|---|
| `seats` | 4, 5, 7, 16, 29, 45 |
| `type` | `sedan`, `suv`, `mpv`, `van`, `minibus`, `bus` |
| `color` | `white`, `black`, `silver`, `grey`, `red`, `blue`, `navy`, `brown` |
| `fuel` | `gasoline`, `diesel`, `electric` |
| `transmission` | `auto`, `manual` |
| `status` | `active`, `maintenance` |
| `city` | `Hà Nội`, `TP. Hồ Chí Minh`, `Đà Nẵng`, `Nha Trang` |
| `features` | `bluetooth`, `camera`, `sunroof`, `gps`, `airbag`, `usb`, `cruise`, `dashcam`, `sensor`, `ac_rear`, `tv`, `mic`, `recline`, `luggage`, `wifi` |

Xe từ 16 chỗ: `driverOnly = true`, giá đã gồm tài xế. `plate` chỉ nên trả đầy đủ cho Admin.

### User

```json
{ "id": "u1", "name": "Nguyễn Văn A", "email": "a@example.com", "phone": "0912345678",
  "role": "user", "blocked": false, "license": "790123456789", "createdAt": "2026-07-01" }
```

`role`: `user` hoặc `admin`. **Không bao giờ trả mật khẩu về FE.** BE phải băm mật khẩu (BCrypt).

### Booking

```json
{
  "id": "b1", "code": "IU1001", "carId": "c1", "userId": "u1",
  "from": "2026-12-10", "to": "2026-12-13",
  "withDriver": false, "driverId": null,
  "extras": ["insurance"], "couponCode": "SINHVIEN15",
  "pickup": "12 Nguyễn Huệ, TP. Hồ Chí Minh",
  "contact": { "name": "Nguyễn Văn A", "phone": "0912345678", "email": "a@example.com", "license": "790123456789" },
  "payment": "cash", "paymentStatus": "unpaid", "status": "pending", "note": "",
  "days": 3, "base": 1950000, "driverFee": 0, "extrasFee": 240000,
  "subtotal": 2190000, "discount": 300000, "total": 1890000, "deposit": 3000000,
  "createdAt": "2026-11-26"
}
```

| Trường | Giá trị |
|---|---|
| `payment` | `cash`, `bank`, `vnpay`, `momo`, `card` |
| `paymentStatus` | `unpaid`, `paid`, `refunded` |
| `status` | `pending`, `confirmed`, `ongoing`, `completed`, `cancelled` |
| `extras` | `insurance`, `roadside`, `childseat`, `wifi` |

### Driver, Coupon, Review

```json
{ "id": "d1", "name": "Trần Văn Hùng", "phone": "0903111222", "licenseClass": "D",
  "years": 12, "status": "available", "rating": 4.9 }
```

`status`: `available`, `busy`, `off`.

```json
{ "id": "p1", "code": "SINHVIEN15", "type": "percent", "value": 15, "maxDiscount": 300000,
  "minTotal": 800000, "expiresAt": "2027-03-01", "usageLimit": 500, "used": 86, "active": true,
  "descVi": "Giảm 15% cho sinh viên IU", "descEn": "15% off for IU students" }
```

`type`: `percent` hoặc `fixed`. `usageLimit = 0` là không giới hạn.

```json
{ "id": "r1", "carId": "c1", "userId": "u1", "userName": "Nguyễn Văn A",
  "rating": 5, "comment": "Xe sạch, chạy êm", "date": "2026-11-20" }
```

## 3. Danh sách API

### Tài khoản

| Method | Đường dẫn | Quyền | Gửi | Nhận |
|---|---|---|---|---|
| POST | `/auth/register` | Công khai | `{name, email, phone, password}` | `{token, user}` |
| POST | `/auth/login` | Công khai | `{email, password}` | `{token, user}` |
| GET | `/users/me` | User | | `User` |
| PATCH | `/users/me` | User | `{name, phone, license}` | `User` |
| PUT | `/users/me/password` | User | `{oldPassword, newPassword}` | 204 |

### Xe và đánh giá

| Method | Đường dẫn | Quyền | Gửi | Nhận |
|---|---|---|---|---|
| GET | `/cars` | Công khai | query (xem dưới) | `Car[]` |
| GET | `/cars/{id}` | Công khai | | `Car` |
| GET | `/cars/{id}/busy-dates` | Công khai | | `[{from, to}]` |
| GET | `/cars/{id}/reviews` | Công khai | | `Review[]` |
| POST | `/cars/{id}/reviews` | User | `{rating, comment}` | `Review` |

Query của `GET /cars` (đều không bắt buộc, nhiều giá trị cách nhau dấu phẩy): `q`, `city`, `brand`, `seatGroups` (4,7,16,30,50), `fuel`, `transmission`, `color`, `rental` (`self`/`driver`), `minPrice`, `maxPrice`, `from`, `to`, `availableOnly`, `sort` (`popular`, `priceAsc`, `priceDesc`, `newest`).

Nhóm số chỗ: ≤5 là 4; 6-9 là 7; 10-17 là 16; 18-32 là 30; còn lại là 50.

### Đặt xe và mã giảm giá

| Method | Đường dẫn | Quyền | Gửi | Nhận |
|---|---|---|---|---|
| POST | `/bookings` | User | `{carId, from, to, withDriver, extras, couponCode, pickup, contact, payment, note}` | `Booking` |
| GET | `/bookings/me` | User | | `Booking[]` |
| GET | `/bookings/{code}` | Chủ đơn, Admin | | `Booking` |
| POST | `/bookings/{id}/cancel` | Chủ đơn | | `Booking` |
| GET | `/coupons` | Công khai | | `Coupon[]` (còn hiệu lực) |
| POST | `/coupons/check` | User | `{code, subtotal}` | `Coupon` hoặc lỗi |

Mã lỗi mã giảm giá: `COUPON_INVALID`, `COUPON_INACTIVE`, `COUPON_EXPIRED`, `COUPON_LIMIT`, `COUPON_MIN_TOTAL`.

### Liên hệ

| Method | Đường dẫn | Quyền | Gửi |
|---|---|---|---|
| POST | `/contact` | Công khai | `{name, email, phone, topic, message}` |
| POST | `/subscribers` | Công khai | `{email}` |

`topic`: `support`, `group`, `partner`, `other`.

### Quản trị (tất cả cần quyền Admin)

| Method | Đường dẫn | Ghi chú |
|---|---|---|
| GET | `/admin/stats` | Doanh thu 6 tháng, số đơn theo trạng thái, số chuyến theo nhóm xe, xe thuê nhiều nhất |
| GET, POST | `/admin/cars` | Danh sách, thêm |
| PUT, DELETE | `/admin/cars/{id}` | Không xóa xe còn đơn `pending`/`confirmed`/`ongoing` |
| GET | `/admin/bookings` | Lọc `status`, `q` |
| PATCH | `/admin/bookings/{id}/status` | `{status}` |
| PATCH | `/admin/bookings/{id}/driver` | `{driverId}` (`null` để bỏ) |
| GET | `/admin/customers` | |
| PATCH | `/admin/customers/{id}/blocked` | `{blocked}` |
| GET, POST | `/admin/drivers` | |
| PUT, DELETE | `/admin/drivers/{id}` | Không xóa tài xế đang có đơn `confirmed`/`ongoing` |
| GET, POST | `/admin/coupons` | Mã không được trùng |
| PUT, DELETE | `/admin/coupons/{id}` | |

## 4. Quy tắc nghiệp vụ (BE phải tự kiểm tra, không tin số tiền FE gửi)

**Tính tiền**

- `days = max(1, to - from)`, và `to` phải sau `from`.
- `base = pricePerDay × days`
- `driverFee = car.driverFee × days` nếu `withDriver` và xe không phải `driverOnly`, ngược lại 0.
- Dịch vụ thêm tính mỗi ngày: `insurance` 80.000, `roadside` 40.000, `childseat` 50.000, `wifi` 40.000.
- `subtotal = base + driverFee + extrasFee`
- Mã giảm giá hợp lệ khi: đang bật, chưa hết hạn, còn lượt, `subtotal ≥ minTotal`. Loại `percent` bị chặn bởi `maxDiscount`; giảm không vượt `subtotal`.
- `total = subtotal - discount`
- `deposit = 0` nếu có tài xế, ngược lại bằng `car.deposit`.
- Xe `driverOnly` luôn lưu `withDriver = true`.

**Xe trống:** xe `maintenance` không đặt được. Hai đơn trùng lịch khi `from < đơnKhác.to` và `to > đơnKhác.from`, xét các đơn `pending`, `confirmed`, `ongoing`.

**Tự lái** cần số GPLX (9-12 số) trong `contact.license`.

**Trạng thái đơn**

```
pending → confirmed → ongoing → completed
pending / confirmed → cancelled
```

- Đơn mới luôn là `pending`.
- Hủy đơn đã `paid` thì `paymentStatus = refunded`. Hủy khi `from ≤ ngày mai` thì tính phí 20%.
- Hoàn thành đơn thì `paymentStatus = paid` và tài xế được phân công trở về `available`.
- Mỗi lần dùng mã giảm giá thành công thì tăng `used`.

## 5. Phần FE tự lưu, BE chưa cần làm

Xe yêu thích, danh sách so sánh, chế độ Sáng/Tối, ngôn ngữ.

## 6. Cần chốt giữa FE và BE

- [ ] Cổng thanh toán: chỉ mô phỏng hay nối sandbox VNPay/MoMo?
- [ ] Ảnh xe: BE lưu đường dẫn hay cho tải file lên?
- [ ] Có phân trang phía server không?
- [ ] Thời hạn token, có cần refresh token không?
