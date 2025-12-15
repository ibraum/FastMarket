import Link from "next/link";
import { Clock, Tag } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product, calculateCurrentPrice, getDaysRemaining } from "@/lib/market-logic";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const currentPrice = calculateCurrentPrice(product);
    const daysRemaining = getDaysRemaining(product);
    const discountPercentage = Math.round(
        ((product.max_price - currentPrice) / product.max_price) * 100
    );

    const imageUrl = product.image_path
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${product.image_path}`
        : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=500";

    return (
        <Link href={`/product/${product.id}`}>
            <Card className="h-full overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg border-border bg-card">
                <div className="aspect-square relative overflow-hidden bg-muted">
                    <img
                        src={imageUrl}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                    {discountPercentage > 0 && (
                        <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                            -{discountPercentage}%
                        </Badge>
                    )}
                </div>
                <CardHeader className="p-4 pb-2">
                    <h3 className="font-semibold tracking-tight text-lg line-clamp-1">
                        {product.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                        by {product.seller?.email?.split('@')[0] ?? 'Unknown Seller'}
                    </p>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground uppercase font-bold">
                                Current Price
                            </span>
                            <span className="text-lg font-bold text-primary">
                                {currentPrice.toLocaleString()} XOF
                            </span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-muted-foreground uppercase font-bold">
                                Max Price
                            </span>
                            <span className="text-sm line-through text-muted-foreground">
                                {product.max_price.toLocaleString()} XOF
                            </span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-4 border-t border-border bg-muted/20 flex justify-between items-center text-sm">
                    <div className="flex items-center text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>{daysRemaining} days left</span>
                    </div>
                    <div className="flex items-center text-primary font-medium">
                        <Tag className="mr-1 h-3 w-3" />
                        <span>Buy Now</span>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
