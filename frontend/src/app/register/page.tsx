'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Shield, Lock, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const registerSchema = z.object({
  username: z.string().min(1, { message: 'Nama tidak boleh kosong' }),
  password: z.string().min(8, { message: 'Password minimal harus 8 karakter' }),
  roles: z.array(z.enum(['BUYER', 'SELLER', 'DRIVER'])).min(1, { message: 'Pilih minimal 1 role' }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      roles: [],
    },
  });

  const selectedRoles = watch('roles');

  const handleRoleCheckboxChange = (role: 'BUYER' | 'SELLER' | 'DRIVER', checked: boolean) => {
    if (checked) {
      setValue('roles', [...selectedRoles, role], { shouldValidate: true });
    } else {
      setValue(
        'roles',
        selectedRoles.filter((r) => r !== role),
        { shouldValidate: true }
      );
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await api.post('/auth/register', data);
      toast.success('Pendaftaran berhasil! Silakan masuk.');
      router.push('/login');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Registrasi gagal. Coba lagi.';
      toast.error(typeof msg === 'string' ? msg : Array.isArray(msg) ? msg[0] : 'Registrasi gagal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-zinc-950">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/50 backdrop-blur-md shadow-2xl shadow-indigo-500/5">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Daftar Akun Baru
          </CardTitle>
          <CardDescription className="text-zinc-400 text-sm">
            Bergabunglah dengan SEAPEDIA dan tentukan peran Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username Input */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-zinc-300 text-xs font-semibold uppercase tracking-wider">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username Anda"
                  className="pl-10 border-zinc-800 bg-zinc-900/50 text-white placeholder-zinc-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-rose-500 font-medium">{errors.username.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300 text-xs font-semibold uppercase tracking-wider">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  className="pl-10 border-zinc-800 bg-zinc-900/50 text-white placeholder-zinc-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Role Checkboxes */}
            <div className="space-y-3">
              <Label className="text-zinc-300 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-indigo-400" /> Pilih Peran Anda (Bisa lebih dari satu)
              </Label>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {[
                  { id: 'BUYER', label: 'Buyer', desc: 'Belanja produk' },
                  { id: 'SELLER', label: 'Seller', desc: 'Jual produk' },
                  { id: 'DRIVER', label: 'Driver', desc: 'Kirim barang' },
                ].map((role) => {
                  const isChecked = selectedRoles.includes(role.id as any);
                  return (
                    <div
                      key={role.id}
                      onClick={() => handleRoleCheckboxChange(role.id as any, !isChecked)}
                      className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                        isChecked
                          ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-md shadow-indigo-500/5'
                          : 'border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleRoleCheckboxChange(role.id as any, !!checked)
                          }
                          className="border-zinc-700 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-sm font-semibold">{role.label}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 text-center">{role.desc}</span>
                    </div>
                  );
                })}
              </div>
              {errors.roles && (
                <p className="text-xs text-rose-500 font-medium">{errors.roles.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-indigo-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mendaftarkan...
                </>
              ) : (
                'Daftar'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-zinc-800/50 p-4">
          <p className="text-zinc-400 text-xs">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-indigo-400 hover:underline font-semibold">
              Masuk di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
