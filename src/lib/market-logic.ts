import { differenceInDays } from "date-fns";
import { Product } from "./database.types";

export function calculateCurrentPrice(product: Product): number {
  if (product.status !== "available") return product.min_price;

  const now = new Date();
  const daysPassed = differenceInDays(now, new Date(product.created_at));
  
  if (daysPassed >= product.total_days) {
    return product.min_price;
  }

  if (daysPassed < 0) {
    return product.max_price;
  }

  const priceRange = product.max_price - product.min_price;
  const pricePerDay = priceRange / product.total_days;
  
  const currentPrice = product.max_price - (pricePerDay * daysPassed);
  
  return Math.max(Math.round(currentPrice), product.min_price);
}

export function getDaysRemaining(product: Product): number {
  const now = new Date();
  const daysPassed = differenceInDays(now, new Date(product.created_at));
  const remaining = product.total_days - daysPassed;
  return Math.max(0, remaining);
}
