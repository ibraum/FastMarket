import { Product, Seller } from "./market-logic";
import { subDays, addDays } from "date-fns";

export const MOCK_SELLERS: Seller[] = [
  {
    id: "s1",
    name: "Alice Trader",
    whatsapp: "+221770000001",
  },
  {
    id: "s2",
    name: "Bob Merchant",
    whatsapp: "+221770000002",
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "iPhone 13 Pro Max",
    description: "Slightly used, battery health 90%. Comes with box and charger.",
    imageUrl: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=500",
    minPrice: 350000,
    maxPrice: 450000,
    daysAvailable: 7,
    createdAt: subDays(new Date(), 2), // Created 2 days ago
    seller: MOCK_SELLERS[0],
    status: "available",
  },
  {
    id: "p2",
    title: "MacBook Air M1",
    description: "Space Grey, 8GB RAM, 256GB SSD. Perfect condition.",
    imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=500",
    minPrice: 400000,
    maxPrice: 550000,
    daysAvailable: 10,
    createdAt: subDays(new Date(), 5), // Created 5 days ago
    seller: MOCK_SELLERS[1],
    status: "available",
  },
  {
    id: "p3",
    title: "Sony WH-1000XM4",
    description: "Noise cancelling headphones. Black. Barely used.",
    imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=500",
    minPrice: 120000,
    maxPrice: 180000,
    daysAvailable: 5,
    createdAt: subDays(new Date(), 1), // Created 1 day ago
    seller: MOCK_SELLERS[0],
    status: "available",
  },
  {
    id: "p4",
    title: "Samsung Galaxy S21",
    description: "Phantom Violet. Unlocked. 128GB.",
    imageUrl: "https://images.unsplash.com/photo-1610945265078-3858726abef5?auto=format&fit=crop&q=80&w=500",
    minPrice: 200000,
    maxPrice: 280000,
    daysAvailable: 14,
    createdAt: subDays(new Date(), 0), // Created today
    seller: MOCK_SELLERS[1],
    status: "available",
  },
];
