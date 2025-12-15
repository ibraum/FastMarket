export interface Seller {
  id: string;
  email: string;
  whatsapp: string;
  created_at?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  image_path: string | null;
  min_price: number;
  max_price: number;
  total_days: number;
  status: "available" | "sold" | "expired";
  created_at: string;
  seller_id: string;
  seller?: Seller;
}

export interface Database {
  public: {
    Tables: {
      sellers: {
        Row: Seller;
        Insert: Omit<Seller, 'id' | 'created_at'>;
        Update: Partial<Omit<Seller, 'id' | 'created_at'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at'>>;
      };
    };
  };
}
