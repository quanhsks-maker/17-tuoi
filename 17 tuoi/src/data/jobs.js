export const JOBS = [
  // Việc làm năm 17 tuổi
  {
    job_id: 'streamer_newbie',
    name: 'Làm content dạo',
    icon: '📱',
    type: 'RANDOM_17',
    income_per_shift: 1600000,
    energy_cost: 50,
    happiness_change: 10,
    funny_quote: 'Thu nhập vừa đủ sống lúc đầu nhưng đỡ gò bó thời gian.'
  },
  {
    job_id: 'barista',
    name: 'Phụ quán nước',
    icon: '☕',
    type: 'RANDOM_17',
    income_per_shift: 2000000,
    energy_cost: 50,
    happiness_change: -5,
    funny_quote: 'Đứng ca mỏi chân nhưng thu nhập ổn định hàng tháng.'
  },
  {
    job_id: 'shipper',
    name: 'Chạy ship',
    icon: '🛵',
    type: 'RANDOM_17',
    income_per_shift: 2500000,
    energy_cost: 50,
    happiness_change: -10,
    funny_quote: 'Dãi nắng dầm mưa, chạy đều tay là đủ tiền trọ.'
  },
  {
    job_id: 'mechanic',
    name: 'Thợ sửa xe',
    icon: '🔧',
    type: 'RANDOM_17',
    income_per_shift: 3000000,
    energy_cost: 50,
    happiness_change: -12,
    funny_quote: 'Tay lấm dầu nhớt nhưng có nghề cứng trong tay.'
  },
  {
    job_id: 'construction',
    name: 'Phụ hồ',
    icon: '🧱',
    type: 'RANDOM_17',
    income_per_shift: 3500000,
    energy_cost: 50,
    happiness_change: -20,
    funny_quote: 'Công cao nhất nhóm lao động phổ thông nhưng rất hao sức.'
  },

  // Việc làm sau khi tốt nghiệp Đại học
  {
    job_id: 'grad_designer',
    name: 'Thiết kế đồ họa',
    icon: '🎨',
    type: 'GRADUATE',
    income_per_shift: 7500000,
    energy_cost: 50,
    happiness_change: -5,
    funny_quote: 'Sửa file theo yêu cầu khách hàng nhưng lương khá.'
  },
  {
    job_id: 'grad_youtuber',
    name: 'Sản xuất nội dung',
    icon: '🎬',
    type: 'GRADUATE',
    income_per_shift: 9000000,
    energy_cost: 50,
    happiness_change: 10,
    funny_quote: 'Làm kênh bài bản, nhận booking đều đặn.'
  },
  {
    job_id: 'grad_dev',
    name: 'Lập trình viên',
    icon: '💻',
    type: 'GRADUATE',
    income_per_shift: 10000000,
    energy_cost: 50,
    happiness_change: -10,
    funny_quote: 'Ngồi văn phòng gõ code, thu nhập tốt nhưng dễ căng thẳng.'
  },
  {
    job_id: 'grad_ceo',
    name: 'Quản lý dự án',
    icon: '📊',
    type: 'GRADUATE',
    income_per_shift: 12000000,
    energy_cost: 50,
    happiness_change: -12,
    funny_quote: 'Áp lực doanh số cao, bù lại thu nhập vượt trội.'
  }
];

export function getRandom17Jobs() {
  return JOBS.filter(job => job.type === 'RANDOM_17');
}

export function getJobById(jobId) {
  return JOBS.find(job => job.job_id === jobId) || null;
}
