"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { Product } from "@/lib/database.types";

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
    minPrice: z.number().min(1, {
        message: "Minimum price must be at least 1.",
    }),
    maxPrice: z.number().min(1, {
        message: "Maximum price must be at least 1.",
    }),
    daysAvailable: z.number().min(1).max(30, {
        message: "Days available must be between 1 and 30.",
    }),
});

export default function EditProductPage() {
    const { user, loading: authLoading } = useAuth();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [product, setProduct] = useState<Product | null>(null);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const supabase = createClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            minPrice: 0,
            maxPrice: 0,
            daysAvailable: 7,
        },
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/signin");
            return;
        }

        if (user && id) {
            fetchProduct();
        }
    }, [user, authLoading, id]);

    async function fetchProduct() {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("id", id)
            .eq("seller_id", user?.id)
            .single();

        if (error || !data) {
            router.push("/dashboard");
            return;
        }

        const p = data as Product;
        setProduct(p);
        form.reset({
            title: p.title,
            description: p.description,
            minPrice: p.min_price,
            maxPrice: p.max_price,
            daysAvailable: p.total_days,
        });
        setLoadingProduct(false);
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user || !product) return;

        setSaving(true);
        setError(null);
        let imagePath = product.image_path;

        if (imageFile) {
            const fileExt = imageFile.name.split(".").pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("product-images")
                .upload(fileName, imageFile);

            if (uploadError) {
                setError(`Error uploading image: ${uploadError.message}`);
                setSaving(false);
                return;
            }

            imagePath = fileName;
        }

        const { error: updateError } = await supabase
            .from("products")
            .update({
                title: values.title,
                description: values.description,
                image_path: imagePath,
                min_price: values.minPrice,
                max_price: values.maxPrice,
                total_days: values.daysAvailable,
            })
            .eq("id", product.id);

        if (updateError) {
            setError(`Error updating product: ${updateError.message}`);
            setSaving(false);
            return;
        }

        router.push("/dashboard");
    }

    if (authLoading || loadingProduct) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-center text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Link
                href="/dashboard"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Edit Listing</h1>
                <p className="text-muted-foreground">
                    Update the details of your listing.
                </p>
            </div>

            <Card className="border-border bg-card">
                <CardContent className="p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
                                    {error}
                                </div>
                            )}
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. iPhone 13 Pro Max" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe the condition, features, and reason for selling..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2">
                                <FormLabel>Product Image</FormLabel>
                                {product?.image_path && (
                                    <div className="h-24 w-24 rounded-md overflow-hidden bg-muted mb-2">
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${product.image_path}`}
                                            alt="Current product image"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setImageFile(file);
                                    }}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Upload a new image to replace the current one (optional)
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="minPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Minimum Price (XOF)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                The lowest price you accept.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="maxPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Maximum Price (XOF)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                The starting price.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="daysAvailable"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Days Available</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            How many days until the price drops to the minimum?
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full font-bold text-lg h-12" disabled={saving}>
                                {saving ? "Saving Changes..." : "Save Changes"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
