"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const signupSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string(),
  role: z.enum(["customer", "canteen"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "customer" },
  });

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...payload } = data;
      await authApi.register(payload);
      toast.success("Akun berhasil dibuat! Silakan login.");
      router.push("/login");
    } catch (error: unknown) {
      const message = typeof (error as any)?.response?.data?.detail === "string"
        ? (error as any)?.response?.data?.detail
        : "Registrasi gagal, coba lagi.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">inCampus Food</CardTitle>
          <CardDescription>Buat akun baru</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" placeholder="John Doe" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="email@campus.ac.id" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">No. HP (opsional)</Label>
              <Input id="phone" type="tel" placeholder="08xxxxxxxxxx" {...register("phone")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Daftar sebagai</Label>
              <Select defaultValue="customer" onValueChange={(val) => setValue("role", val as SignupForm["role"])}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="canteen">Staff Kantin</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mendaftar...</>
              ) : "Daftar"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">Masuk</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
