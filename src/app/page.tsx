"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/ProductCard";
import { getDaysRemaining, calculateCurrentPrice } from "@/lib/market-logic";
import { Product } from "@/lib/database.types";
import { createClient } from "@/lib/supabase";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | "">("");
  const [minDaysFilter, setMinDaysFilter] = useState<number | "">("");
  const supabase = createClient();

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          seller:sellers(*)
        `)
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProducts(data as unknown as Product[]);
      }
      setLoading(false);
    }

    fetchProducts();
  }, [supabase]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const currentPrice = calculateCurrentPrice(product);
    const matchesPrice = maxPriceFilter
      ? currentPrice <= maxPriceFilter
      : true;

    const daysRemaining = getDaysRemaining(product);
    const matchesDays = minDaysFilter
      ? daysRemaining >= minDaysFilter
      : true;

    return matchesSearch && matchesPrice && matchesDays;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            Sell Goods Fast. Help People in Need.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            The marketplace where prices drop every day. Find great deals or sell your items quickly to those who need them most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/create">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                Start Selling
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8">
              Explore Deals
            </Button>
          </div>
        </div>
      </section>

      {/* Filter & Search Section */}
      <section className="sticky top-16 z-40 bg-background/95 backdrop-blur py-4 border-b">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for products..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="flex items-center gap-2 min-w-[200px]">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="Max Price (XOF)"
                className="w-32"
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(e.target.value ? Number(e.target.value) : "")}
              />
            </div>
            <div className="flex items-center gap-2 min-w-[200px]">
              <Input
                type="number"
                placeholder="Min Days Left"
                className="w-32"
                value={minDaysFilter}
                onChange={(e) => setMinDaysFilter(e.target.value ? Number(e.target.value) : "")}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="flex-1 py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Featured Listings</h2>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">Loading products...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">No products found matching your criteria.</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery("");
                  setMaxPriceFilter("");
                  setMinDaysFilter("");
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
