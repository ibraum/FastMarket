"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { Seller } from "@/lib/database.types";

export default function SettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const [seller, setSeller] = useState<Seller | null>(null);
    const [whatsapp, setWhatsapp] = useState("");
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/signin");
            return;
        }

        if (user) {
            fetchSeller();
        }
    }, [user, authLoading]);

    async function fetchSeller() {
        if (!user) return;
        const { data, error } = await supabase
            .from("sellers")
            .select("*")
            .eq("id", user?.id)
            .single();

        if (!error && data) {
            const s = data as Seller;
            setSeller(s);
            setWhatsapp(s.whatsapp ?? "");
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setError(null);
        setSuccess(false);

        const { error: updateError } = await supabase
            .from("sellers")
            .update({ whatsapp })
            .eq("id", user.id);

        if (updateError) {
            setError(updateError.message);
        } else {
            setSuccess(true);
        }
        setSaving(false);
    }

    if (authLoading) {
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
                <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground">
                    Manage your profile and account preferences.
                </p>
            </div>

            <div className="space-y-6">
                <Card className="border-border bg-card">
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>
                            Update your contact information visible to buyers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded">
                                    Settings saved successfully.
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={seller?.email ?? user?.email ?? ""}
                                    disabled
                                    className="opacity-60"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Your email address cannot be changed here.
                                </p>
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
                                <p className="text-xs text-muted-foreground">
                                    Buyers use this number to contact you about your listings.
                                </p>
                            </div>
                            <Button type="submit" disabled={saving}>
                                <Save className="mr-2 h-4 w-4" />
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card">
                    <CardHeader>
                        <CardTitle>Password</CardTitle>
                        <CardDescription>
                            Change your account password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            To change your password, request a password reset email.
                        </p>
                        <Link href="/auth/forgot-password">
                            <Button variant="outline">Reset Password</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
