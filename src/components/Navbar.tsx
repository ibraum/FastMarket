"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "./AuthProvider";
import { createClient } from "@/lib/supabase";

export function Navbar() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center px-4">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                    <span className="hidden font-bold sm:inline-block">
                        FastMarket
                    </span>
                </Link>
                <div className="flex flex-1 items-center space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                className="pl-8 md:w-[300px] lg:w-[400px]"
                            />
                        </div>
                    </div>
                    <nav className="flex items-center space-x-2">
                        {!loading && (
                            <>
                                {user ? (
                                    <>
                                        <Link href="/dashboard">
                                            <Button variant="ghost">Dashboard</Button>
                                        </Link>
                                        <Link href="/dashboard/create">
                                            <Button>Sell Now</Button>
                                        </Link>
                                        <Button variant="ghost" size="icon" onClick={handleSignOut}>
                                            <LogOut className="h-4 w-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/auth/signin">
                                            <Button variant="ghost">Sign In</Button>
                                        </Link>
                                        <Link href="/auth/signup">
                                            <Button>Sign Up</Button>
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </nav>
    );
}
