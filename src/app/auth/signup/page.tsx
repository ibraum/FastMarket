"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Sign up the user with metadata
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    whatsapp: whatsapp, // Store whatsapp in user metadata
                },
            },
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        // The trigger will automatically create the seller profile
        if (authData.user) {
            // Optionally update the whatsapp if needed
            const { error: updateError } = await supabase
                .from("sellers")
                .update({ whatsapp })
                .eq("id", authData.user.id);

            if (updateError) {
                console.warn("Could not update whatsapp:", updateError);
            }

            router.push("/dashboard");
        }
    };

    return (
        <div className="container mx-auto flex items-center justify-center min-h-screen py-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Sign Up</CardTitle>
                    <CardDescription>
                        Create a seller account to start listing your products.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignUp} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp Number</Label>
                            <Input
                                id="whatsapp"
                                type="tel"
                                placeholder="+221770000000"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                            <p className="text-xs text-muted-foreground">
                                Must be at least 6 characters
                            </p>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating account..." : "Sign Up"}
                        </Button>
                        <p className="text-sm text-center text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/auth/signin" className="text-primary hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
