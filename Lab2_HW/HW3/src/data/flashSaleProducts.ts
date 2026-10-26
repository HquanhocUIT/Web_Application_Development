export interface FlashSaleProduct {
  id: string
  name: string
  category: string
  description: string
  icon: string
  accent: string
  salePriceVnd: number
  originalPriceVnd: number
  availableQuantity: number
  initialQuantity: number
  soldQuantity: number
  label: string
}

export const flashSaleProducts: FlashSaleProduct[] = [
  {
    id: 'headphones',
    name: 'Tai nghe chụp tai không dây',
    category: 'Âm thanh',
    description: 'Âm thanh sống động, đệm tai êm cho ngày dài.',
    icon: '🎧',
    accent: 'lilac',
    salePriceVnd: 599000,
    originalPriceVnd: 990000,
    availableQuantity: 12,
    initialQuantity: 30,
    soldQuantity: 18,
    label: 'BÁN CHẠY',
  },
  {
    id: 'coffee-maker',
    name: 'Máy pha cà phê nhỏ gọn',
    category: 'Nhà cửa',
    description: 'Khởi đầu buổi sáng thơm ngon chỉ với một nút bấm.',
    icon: '☕',
    accent: 'peach',
    salePriceVnd: 829000,
    originalPriceVnd: 1290000,
    availableQuantity: 7,
    initialQuantity: 20,
    soldQuantity: 13,
    label: 'GIÁ TỐT',
  },
  {
    id: 'backpack',
    name: 'Balo đi làm chống thấm',
    category: 'Phụ kiện',
    description: 'Nhiều ngăn tiện dụng, sẵn sàng cho mọi hành trình.',
    icon: '🎒',
    accent: 'mint',
    salePriceVnd: 459000,
    originalPriceVnd: 750000,
    availableQuantity: 3,
    initialQuantity: 24,
    soldQuantity: 21,
    label: 'SẮP HẾT',
  },
  {
    id: 'desk-lamp',
    name: 'Đèn bàn LED đa chế độ',
    category: 'Góc học tập',
    description: 'Ánh sáng dịu mắt, thiết kế gọn cho bàn làm việc.',
    icon: '💡',
    accent: 'sky',
    salePriceVnd: 349000,
    originalPriceVnd: 540000,
    availableQuantity: 0,
    initialQuantity: 16,
    soldQuantity: 16,
    label: 'HẾT HÀNG',
  },
]

const now = Date.now()

export const sampleSale = {
  startsAt: now - 5 * 60 * 1000,
  endsAt: now + 90 * 60 * 1000,
}
