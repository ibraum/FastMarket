import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Share2, ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase-server";
import { calculateCurrentPrice, getDaysRemaining } from "@/lib/market-logic";
import { Product } from "@/lib/database.types";

interface ProductPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: product, error } = await supabase
        .from("products")
        .select(`
      *,
      seller:sellers(*)
    `)
        .eq("id", id)
        .single();

    if (error || !product) {
        notFound();
    }

    const typedProduct = product as unknown as Product;
    const currentPrice = calculateCurrentPrice(typedProduct);
    const daysRemaining = getDaysRemaining(typedProduct);
    const discountPercentage = Math.round(
        ((typedProduct.max_price - currentPrice) / typedProduct.max_price) * 100
    );

    const imageUrl = typedProduct.image_path
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${typedProduct.image_path}`
        : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=500";

    return (
        <div className="container mx-auto px-4 py-8">
            <Link
                href="/"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Marketplace
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Product Image */}
                <div className="space-y-4">
                    <div className="aspect-square relative overflow-hidden rounded-xl border border-border bg-muted">
                        <img
                            src={imageUrl}
                            alt={typedProduct.title}
                            className="h-full w-full object-cover"
                        />
                        {discountPercentage > 0 && (
                            <Badge className="absolute top-4 right-4 text-lg px-3 py-1 bg-red-500">
                                -{discountPercentage}%
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                            <Clock className="h-5 w-5" />
                            <span>Time Remaining:</span>
                        </div>
                        <span className="font-mono text-xl font-bold text-foreground">
                            {daysRemaining} Days
                        </span>
                    </div>
                </div>

                {/* Product Details */}
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-primary uppercase tracking-wider">
                                {typedProduct.status}
                            </span>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon">
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-4">
                            {typedProduct.title}
                        </h1>
                        <div className="flex items-center space-x-2 mb-6">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                {typedProduct.seller?.email?.charAt(0).toUpperCase() ?? "?"}
                            </div>
                            <span className="text-muted-foreground">
                                Listed by <span className="text-foreground font-medium">{typedProduct.seller?.email?.split('@')[0] ?? 'Unknown'}</span>
                            </span>
                        </div>
                    </div>

                    <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
                        <div className="mb-2 text-sm text-muted-foreground uppercase font-bold">
                            Current Price
                        </div>
                        <div className="flex items-baseline gap-4 mb-6">
                            <span className="text-5xl font-black text-primary tracking-tight">
                                {currentPrice.toLocaleString()} <span className="text-2xl font-bold text-muted-foreground">XOF</span>
                            </span>
                            <span className="text-xl line-through text-muted-foreground decoration-2">
                                {typedProduct.max_price.toLocaleString()} XOF
                            </span>
                        </div>

                        <div className="space-y-3">
                            <Button size="lg" className="w-full text-lg h-14 font-bold" asChild>
                                <a
                                    href={`https://wa.me/${typedProduct.seller?.whatsapp}?text=Hi, I'm interested in buying ${typedProduct.title} for ${currentPrice} XOF.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Phone className="mr-2 h-5 w-5" />
                                    Contact Seller on WhatsApp
                                </a>
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                                Clicking will open WhatsApp to chat directly with the seller.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">Description</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {typedProduct.description}
                        </p>
                    </div>

                    <Card className="bg-muted/20 border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center">
                                <ShieldCheck className="mr-2 h-5 w-5 text-green-500" />
                                Safety Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-1">
                            <p>• Meet in a public place.</p>
                            <p>• Check the item before paying.</p>
                            <p>• Do not pay in advance.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
