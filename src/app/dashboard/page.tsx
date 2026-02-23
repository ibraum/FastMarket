"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Settings, Trash2, Edit, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { calculateCurrentPrice, getDaysRemaining } from "@/lib/market-logic";
import { Product } from "@/lib/database.types";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/signin");
            return;
        }

        if (user) {
            fetchProducts();
        }
    }, [user, authLoading, router]);

    async function fetchProducts() {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("seller_id", user?.id)
            .order("created_at", { ascending: false });

        if (!error && data) {
            setProducts(data as Product[]);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this product?")) return;

        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", id);

        if (!error) {
            setProducts(products.filter(p => p.id !== id));
        }
    }

    async function handleToggleStatus(product: Product) {
        const newStatus = product.status === "available" ? "sold" : "available";

        const { error } = await supabase
            .from("products")
            .update({ status: newStatus })
            .eq("id", product.id);

        if (!error) {
            setProducts(products.map(p =>
                p.id === product.id ? { ...p, status: newStatus } : p
            ));
        }
    }

    if (authLoading || loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-center text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage your listings and account settings.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/settings">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Link>
                    </Button>
                    <Link href="/dashboard/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Listing
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="rounded-md border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Image</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Current Price</TableHead>
                            <TableHead>Days Left</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => {
                            const imageUrl = product.image_path
                                ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${product.image_path}`
                                : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=500";

                            return (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="h-12 w-12 rounded-md overflow-hidden bg-muted">
                                            <img
                                                src={imageUrl}
                                                alt={product.title}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{product.title}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.status === "available" ? "default" : "secondary"}>
                                            {product.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{calculateCurrentPrice(product).toLocaleString()} XOF</TableCell>
                                    <TableCell>{getDaysRemaining(product)} days</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title={product.status === "available" ? "Mark as sold" : "Mark as available"}
                                                onClick={() => handleToggleStatus(product)}
                                            >
                                                {product.status === "available"
                                                    ? <CheckCircle className="h-4 w-4" />
                                                    : <RefreshCw className="h-4 w-4" />
                                                }
                                            </Button>
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/dashboard/edit/${product.id}`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {products.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No products found. Start selling today!
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
