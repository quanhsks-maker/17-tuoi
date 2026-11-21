export const EXAM_QUESTIONS = [
  {
    q: 'Đạo hàm của hàm số y = x³ là gì?',
    options: ['3x²', 'x²', '3x', '2x³'],
    answer: 0
  },
  {
    q: 'Tác giả của truyện ngắn "Chí Phèo" là ai?',
    options: ['Vũ Trọng Phụng', 'Nam Cao', 'Ngô Tất Tố', 'Nguyễn Công Hoan'],
    answer: 1
  },
  {
    q: 'Chiến dịch Điện Biên Phủ kết thúc thắng lợi vào năm nào?',
    options: ['1945', '1950', '1954', '1975'],
    answer: 2
  },
  {
    q: 'Trong kinh tế, khi cung lớn hơn cầu thì giá cả hàng hóa thường có xu hướng nào?',
    options: ['Tăng mạnh', 'Giảm xuống', 'Không đổi', 'Tăng gấp đôi'],
    answer: 1
  },
  {
    q: 'Công thức hóa học của khí Amoniac là gì?',
    options: ['NO₂', 'NH₃', 'N₂O', 'HNO₃'],
    answer: 1
  },
  {
    q: 'Giá trị của log₂(8) bằng bao nhiêu?',
    options: ['2', '3', '4', '6'],
    answer: 1
  },
  {
    q: 'Theo quy định pháp luật Việt Nam, công dân đủ bao nhiêu tuổi thì được thi bằng lái xe máy hạng A1?',
    options: ['16 tuổi', '17 tuổi', '18 tuổi', '20 tuổi'],
    answer: 2
  },
  {
    q: 'Tác phẩm "Số đỏ" với nhân vật Xuân Tóc Đỏ là của nhà văn nào?',
    options: ['Vũ Trọng Phụng', 'Thạch Lam', 'Nguyễn Tuân', 'Xuân Diệu'],
    answer: 0
  },
  {
    q: 'Lạm phát tăng cao đồng nghĩa với việc nào sau đây?',
    options: ['Đồng tiền mất giá', 'Hàng hóa rẻ đi', 'Lương tự động tăng', 'Không ảnh hưởng gì'],
    answer: 0
  },
  {
    q: 'Nếu gửi tiết kiệm 10 triệu đồng với lãi suất đơn 6%/năm, sau 1 năm tiền lãi nhận được là bao nhiêu?',
    options: ['60.000đ', '600.000đ', '1.600.000đ', '6.000.000đ'],
    answer: 1
  },
  {
    q: 'Quốc gia nào sau đây KHÔNG có chung đường biên giới trên đất liền với Việt Nam?',
    options: ['Trung Quốc', 'Lào', 'Campuchia', 'Thái Lan'],
    answer: 3
  },
  {
    q: 'Trong phương trình bậc hai ax² + bx + c = 0 (a ≠ 0), biệt thức Δ (Delta) được tính bằng công thức nào?',
    options: ['b² - 4ac', 'b² + 4ac', '4ac - b²', 'b - 4ac'],
    answer: 0
  },
  {
    q: 'Sự kiện Bác Hồ đọc Tuyên ngôn Độc lập diễn ra tại quảng trường nào?',
    options: ['Quảng trường 2/9', 'Quảng trường Ba Đình', 'Quảng trường Cách mạng Tháng 8', 'Quảng trường Lam Sơn'],
    answer: 1
  },
  {
    q: 'Độ pH của nước tinh khiết ở điều kiện tiêu chuẩn là bao nhiêu?',
    options: ['5', '7', '9', '14'],
    answer: 1
  },
  {
    q: 'Trong câu "Mùa xuân là Tết trồng cây", biện pháp tu từ nào được sử dụng?',
    options: ['So sánh', 'Nhân hóa', 'Nói quá', 'Điệp ngữ'],
    answer: 0
  }
];

export function pickRandomQuestions(count = 5) {
  const pool = [...EXAM_QUESTIONS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
