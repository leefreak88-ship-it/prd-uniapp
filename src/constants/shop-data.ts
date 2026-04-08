import type { Category, Product } from "@/api/types";

export const categories: Category[] = [
  { id: "digital", name: "数码家电" },
  { id: "food", name: "食品生鲜" },
  { id: "daily", name: "日用百货" },
  { id: "sports", name: "运动户外" },
];

export const products: Product[] = [
  {
    id: "p1",
    categoryId: "digital",
    name: "降噪蓝牙耳机",
    price: 299,
    desc: "主动降噪，40小时续航",
    stock: 120,
    image: "https://dummyimage.com/240x240/eff3ff/4263eb.png&text=Earphone",
  },
  {
    id: "p2",
    categoryId: "digital",
    name: "便携咖啡机",
    price: 459,
    desc: "支持冷热双模式，Type-C 充电",
    stock: 80,
    image: "https://dummyimage.com/240x240/fff4e6/d9480f.png&text=Coffee",
  },
  {
    id: "p3",
    categoryId: "food",
    name: "精品坚果礼盒",
    price: 128,
    desc: "8种混合坚果，独立小包装",
    stock: 210,
    image: "https://dummyimage.com/240x240/ebfbee/2b8a3e.png&text=Nuts",
  },
  {
    id: "p4",
    categoryId: "food",
    name: "冷萃咖啡液",
    price: 69,
    desc: "无糖低酸，适合冷饮调配",
    stock: 300,
    image: "https://dummyimage.com/240x240/e7f5ff/1864ab.png&text=Coffee+Liquid",
  },
  {
    id: "p5",
    categoryId: "daily",
    name: "抑菌洗手液",
    price: 29,
    desc: "温和不伤手，500ml",
    stock: 560,
    image: "https://dummyimage.com/240x240/f8f0fc/862e9c.png&text=Hand+Wash",
  },
  {
    id: "p6",
    categoryId: "sports",
    name: "瑜伽弹力带",
    price: 39,
    desc: "三档阻力，适合居家训练",
    stock: 430,
    image: "https://dummyimage.com/240x240/fff5f5/c92a2a.png&text=Yoga+Band",
  },
];
