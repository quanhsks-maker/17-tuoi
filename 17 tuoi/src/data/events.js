export const MONTHLY_EVENTS = [
  {
    id: 'sick_flu',
    title: 'Trở trời, bị cảm cúm',
    desc: 'Sáng dậy thấy người ê ẩm, đau đầu do dầm mưa hôm trước. Bạn xử lý sao?',
    choices: [
      {
        label: 'Ra tiệm mua thuốc uống (150k)',
        style: 'safe',
        apply: (save) => {
          save.stats.money -= 150000;
          return {
            msg: 'Uống thuốc đầy đủ nên khỏe nhanh (-150k).',
            floatText: '-150k',
            floatColor: '#f87171'
          };
        }
      },
      {
        label: 'Kệ, tự nằm nghỉ cho qua (-20 Thể lực)',
        style: 'risk',
        apply: (save) => {
          save.stats.energy -= 20;
          save.stats.happiness -= 5;
          return {
            msg: 'Tiết kiệm được tiền thuốc nhưng người hơi đuối (-20 Thể lực).',
            floatText: '-20 Thể lực',
            floatColor: '#fbbf24'
          };
        }
      }
    ]
  },
  {
    id: 'neighbor_karaoke',
    title: 'Hàng xóm hát karaoke tới khuya',
    desc: 'Phòng bên cạnh mở loa kẹo kéo hát từ tối tới 11h đêm không ngủ nổi.',
    choices: [
      {
        label: 'Mua nút bịt tai & chịu khó ngủ (40k)',
        style: 'safe',
        apply: (save) => {
          save.stats.money -= 40000;
          return {
            msg: 'Đỡ ồn hẳn, ngủ ngon tới sáng (-40k).',
            floatText: '-40k',
            floatColor: '#f87171'
          };
        }
      },
      {
        label: 'Qua nhắc nhẹ nhàng',
        style: 'risk',
        apply: (save) => {
          if (Math.random() < 0.65) {
            save.stats.happiness += 5;
            return {
              msg: 'Họ xin lỗi rồi tắt loa ngay (+5 Tinh thần).',
              floatText: '+5 Tinh thần',
              floatColor: '#34d399'
            };
          }
          save.stats.happiness -= 12;
          return {
            msg: 'Cãi qua cãi lại mất vui, cả đêm trằn trọc (-12 Tinh thần).',
            floatText: '-12 Tinh thần',
            floatColor: '#f87171'
          };
        }
      }
    ]
  },
  {
    id: 'side_hustle',
    title: 'Có người nhờ phụ việc cuối tuần',
    desc: 'Anh quen ở khu trọ cần người phụ dọn kho gấp trong 1 ngày, trả công 450.000đ.',
    choices: [
      {
        label: 'Nhận luôn (+450k | -25 Thể lực)',
        style: 'safe',
        apply: (save) => {
          if (save.stats.energy < 25) {
            return {
              msg: 'Không đủ 25 Thể lực nên bạn đành hẹn anh ấy dịp khác.',
              floatText: 'Thiếu sức',
              floatColor: '#94a3b8'
            };
          }
          save.stats.money += 450000;
          save.stats.energy -= 25;
          return {
            msg: 'Làm xong hơi mỏi lưng nhưng có thêm 450.000đ.',
            floatText: '+450k',
            floatColor: '#34d399'
          };
        }
      },
      {
        label: 'Từ chối để giữ sức (+5 Tinh thần)',
        style: 'risk',
        apply: (save) => {
          save.stats.happiness += 5;
          return {
            msg: 'Ở phòng nghỉ ngơi cho khỏe người (+5 Tinh thần).',
            floatText: '+5 Tinh thần',
            floatColor: '#34d399'
          };
        }
      }
    ]
  },
  {
    id: 'broken_fan',
    title: 'Quạt điện trong phòng bị hỏng',
    desc: 'Trời đang nóng mà cây quạt quay lờ đờ rồi đứng im luôn.',
    choices: [
      {
        label: 'Mua quạt mới xài cho bền (350k | +5 Tinh thần)',
        style: 'safe',
        apply: (save) => {
          save.stats.money -= 350000;
          save.stats.happiness += 5;
          return {
            msg: 'Phòng mát rượi trở lại (-350k, +5 Tinh thần).',
            floatText: '-350k',
            floatColor: '#f87171'
          };
        }
      },
      {
        label: 'Tự tháo ra mày mò sửa (-15 Thể lực)',
        style: 'risk',
        apply: (save) => {
          if (save.stats.energy < 15) {
            return {
              msg: 'Đang mệt nên bạn để đó, chưa đủ sức tháo quạt sửa.',
              floatText: 'Thiếu sức',
              floatColor: '#94a3b8'
            };
          }
          save.stats.energy -= 15;
          if (Math.random() < 0.6) {
            save.stats.knowledge += 3;
            return {
              msg: 'Hên sao thay tụ xong chạy lại ngon ơ (+3 Học lực).',
              floatText: '+3 Học lực',
              floatColor: '#38bdf8'
            };
          }
          save.stats.money -= 200000;
          return {
            msg: 'Sửa xong bốc khói luôn, đành mua quạt cũ 200k (-200k).',
            floatText: '-200k',
            floatColor: '#f87171'
          };
        }
      }
    ]
  },
  {
    id: 'old_friend_loan',
    title: 'Bạn cũ nhắn tin hỏi mượn 500k',
    desc: 'Đứa bạn cấp 3 lâu ngày không nói chuyện tự nhiên nhắn mượn 500.000đ, hứa tháng sau trả.',
    choices: [
      {
        label: 'Từ chối khéo, nói mình cũng đang kẹt',
        style: 'safe',
        apply: () => {
          return {
            msg: 'Giữ được tiền trong túi, đỡ phải đi đòi nợ sau này.',
            floatText: 'An toàn',
            floatColor: '#94a3b8'
          };
        }
      },
      {
        label: 'Cho mượn 500k',
        style: 'risk',
        apply: (save) => {
          if (save.stats.money < 500000) {
            return {
              msg: 'Mở ví ra thấy không đủ 500k nên thôi luôn.',
              floatText: 'Không đủ tiền',
              floatColor: '#94a3b8'
            };
          }
          if (Math.random() < 0.4) {
            save.stats.money += 100000;
            save.stats.happiness += 10;
            return {
              msg: 'Nó trả đúng hẹn còn mời thêm chầu ăn (+100k, +10 Tinh thần).',
              floatText: '+100k',
              floatColor: '#34d399'
            };
          }
          save.stats.money -= 500000;
          save.stats.happiness -= 15;
          return {
            msg: 'Chuyển xong nó im re luôn, coi như bài học 500k (-15 Tinh thần).',
            floatText: '-500k',
            floatColor: '#f87171'
          };
        }
      }
    ]
  }
];

export function pickRandomMonthlyEvent() {
  const idx = Math.floor(Math.random() * MONTHLY_EVENTS.length);
  return MONTHLY_EVENTS[idx];
}