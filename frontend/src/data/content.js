// Nội dung tĩnh (FAQ, đánh giá, ...) - có sẵn cả tiếng Việt và tiếng Anh

export const FAQS = [
  {
    q: { vi: 'Tôi cần giấy tờ gì để thuê xe tự lái?', en: 'What documents do I need for a self-drive rental?' },
    a: { vi: 'Bạn cần CCCD/hộ chiếu và giấy phép lái xe (GPLX) còn hạn phù hợp loại xe (hạng B1/B2 cho xe đến 9 chỗ). Sinh viên có thể xuất trình thêm thẻ sinh viên để nhận ưu đãi.', en: 'You need an ID/passport and a valid driving licence for the vehicle class (B1/B2 for up to 9 seats). Students can also show a student card for discounts.' },
  },
  {
    q: { vi: 'Xe 16, 29, 45 chỗ có tự lái được không?', en: 'Can I self-drive 16, 29 or 45-seat vehicles?' },
    a: { vi: 'Xe từ 16 chỗ trở lên chỉ cho thuê kèm tài xế chuyên nghiệp để đảm bảo an toàn. Giá hiển thị đã bao gồm tài xế; chưa gồm xăng dầu, phí cầu đường và bến bãi.', en: 'Vehicles with 16+ seats are rented with a professional driver only for safety. Displayed prices include the driver; fuel, tolls and parking are not included.' },
  },
  {
    q: { vi: 'Tiền cọc là bao nhiêu và khi nào được hoàn?', en: 'How much is the deposit and when is it refunded?' },
    a: { vi: 'Xe tự lái đặt cọc từ 3 đến 5 triệu đồng tùy dòng xe. Tiền cọc được hoàn trong vòng 24 giờ sau khi trả xe nếu xe không phát sinh hư hỏng hay vi phạm giao thông.', en: 'Self-drive cars require a 3 to 5 million VND deposit depending on the model. It is refunded within 24 hours after return if there is no damage or traffic violation.' },
  },
  {
    q: { vi: 'Tôi có thể hủy hoặc đổi lịch thuê không?', en: 'Can I cancel or reschedule my booking?' },
    a: { vi: 'Bạn có thể hủy miễn phí trước giờ nhận xe 24 giờ. Hủy trong vòng 24 giờ sẽ tính phí 20% giá trị đơn. Vào mục "Đơn thuê của tôi" để hủy hoặc liên hệ hotline để đổi lịch.', en: 'Cancel free up to 24 hours before pickup. Later cancellations cost 20% of the order. Use "My bookings" to cancel or call the hotline to reschedule.' },
  },
  {
    q: { vi: 'Giới hạn quãng đường và phụ phí như thế nào?', en: 'What are the mileage limits and extra fees?' },
    a: { vi: 'Xe tự lái có giới hạn 300 km/ngày, vượt mức tính 3.000đ/km. Xe có tài xế tính theo lịch trình đã thỏa thuận; phát sinh ngoài lịch trình sẽ báo giá trước.', en: 'Self-drive cars include 300 km/day, extra km cost 3,000 VND. Chauffeur rentals follow the agreed itinerary; extras are quoted in advance.' },
  },
  {
    q: { vi: 'Thanh toán bằng cách nào?', en: 'How can I pay?' },
    a: { vi: 'Hỗ trợ tiền mặt khi nhận xe, chuyển khoản, VNPay, MoMo và thẻ ATM/Visa/Mastercard. Hóa đơn điện tử được gửi qua email sau khi hoàn tất.', en: 'Cash at pickup, bank transfer, VNPay, MoMo and ATM/Visa/Mastercard are supported. An e-invoice is emailed after completion.' },
  },
  {
    q: { vi: 'Xe gặp sự cố giữa đường thì sao?', en: 'What if the car breaks down on the road?' },
    a: { vi: 'Liên hệ hotline 1900 6868 hoạt động 24/7. Chúng tôi hỗ trợ cứu hộ hoặc thay xe tương đương trong thời gian sớm nhất (miễn phí nếu lỗi do xe).', en: 'Call the 24/7 hotline 1900 6868. We arrange roadside help or a replacement vehicle as soon as possible (free if the fault is the vehicle\'s).' },
  },
]

export const TESTIMONIALS = [
  {
    name: 'Trần Thu Hà',
    role: { vi: 'Sinh viên năm 3, ĐH Quốc tế', en: '3rd-year student, IU' },
    text: { vi: 'Mình thuê Vios đi Vũng Tàu cuối tuần. Đặt trong 2 phút, giá sinh viên rẻ, xe sạch và đúng giờ.', en: 'Rented a Vios for a weekend in Vung Tau. Booked in 2 minutes, student price, clean car, on time.' },
    rating: 5,
  },
  {
    name: 'Nguyễn Hoàng Nam',
    role: { vi: 'Trưởng phòng nhân sự', en: 'HR manager' },
    text: { vi: 'Công ty thuê xe 29 chỗ cho chuyến team building. Tài xế chuyên nghiệp, xe có karaoke, cả đoàn rất hài lòng.', en: 'We rented a 29-seater for team building. Professional driver, karaoke on board, everyone loved it.' },
    rating: 5,
  },
  {
    name: 'Lê Phương Anh',
    role: { vi: 'Khách du lịch', en: 'Traveller' },
    text: { vi: 'Đi Đà Nẵng cùng gia đình bằng Xpander. Thủ tục gọn, nhân viên hỗ trợ nhiệt tình, sẽ quay lại.', en: 'Family trip in Da Nang with an Xpander. Simple paperwork, helpful staff. We will be back.' },
    rating: 4,
  },
]
