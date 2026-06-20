'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';
import { useAuth, Role, User as UserType } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Lock, User as UserIcon, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  username: z.string().min(1, { message: 'Nama tidak boleh kosong' }),
  password: z.string().min(8, { message: 'Password minimal 8 karakter!' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSettingRole, setIsSettingRole] = useState(false);

  // States for multi-role selection workflow
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<UserType | null>(null);
  const [tempToken, setTempToken] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      // 1. Hit login endpoint
      const response = await api.post<{ accessToken: string }>('/auth/login', data);
      const token = response.data.accessToken;

      // Temporary save token in cookie so we can request GET /auth/me
      Cookies.set('token', token, { expires: 1 });

      // 2. Fetch the profile details (to get activeRole)
      const profileResponse = await api.get<UserType>('/auth/me');
      const profile = profileResponse.data;

      // 3. Evaluate active role workflow
      if (profile.activeRole) {
        // Active role is already set, finalize login
        login(token, profile);
        toast.success(`Selamat datang kembali, ${profile.username}!`);
        
        const redirectPath = searchParams.get('redirect') || '/dashboard';
        router.push(redirectPath);
      } else {
        // No active role set
        if (profile.roles.length === 1) {
          // Single role: automatically set it as active
          setIsSettingRole(true);
          try {
            const patchResponse = await api.patch<UserType>('/auth/active-role', {
              activeRole: profile.roles[0],
            });
            login(token, patchResponse.data);
            toast.success(`Selamat datang, ${profile.username}!`);
            router.push('/dashboard');
          } catch (err) {
            toast.error('Gagal mengaktifkan role default');
          } finally {
            setIsSettingRole(false);
          }
        } else if (profile.roles.length > 1) {
          // Multi-role: force user to choose active role
          setLoggedInUser(profile);
          setTempToken(token);
          setShowRoleSelector(true);
        } else {
          // Fallback if no roles
          login(token, profile);
          router.push('/dashboard');
        }
      }
    } catch (error: any) {
      // Clear token if set temporarily
      Cookies.remove('token');
      const msg = error.response?.data?.message || 'Nama atau password salah.';
      toast.error(typeof msg === 'string' ? msg : 'Kredensial tidak valid');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectRole = async (role: Role) => {
    if (!loggedInUser || !tempToken) return;
    setIsSettingRole(true);
    try {
      // API call to set activeRole
      const response = await api.patch<UserType>('/auth/active-role', { activeRole: role });
      
      // Finalize login with updated profile
      login(tempToken, response.data);
      toast.success(`Role aktif diset ke ${role.toLowerCase()}. Selamat datang!`);
      
      const redirectPath = searchParams.get('redirect') || '/dashboard';
      router.push(redirectPath);
    } catch (error) {
      toast.error('Gagal memperbarui peran aktif');
    } finally {
      setIsSettingRole(false);
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'SELLER':
        return 'Penjual (Seller)';
      case 'DRIVER':
        return 'Kurir (Driver)';
      case 'BUYER':
      default:
        return 'Pembeli (Buyer)';
    }
  };

  if (showRoleSelector && loggedInUser) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-zinc-950">
        <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/50 backdrop-blur-md shadow-2xl">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Pilih Peran Aktif
            </CardTitle>
            <CardDescription className="text-zinc-400 text-sm">
              Akun Anda memiliki lebih dari satu peran. Pilih salah satu untuk sesi dasbor saat ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              {loggedInUser.roles.map((role) => (
                <button
                  key={role}
                  disabled={isSettingRole}
                  onClick={() => handleSelectRole(role)}
                  className="flex items-center justify-between p-4 border border-zinc-800 bg-zinc-900/40 rounded-lg hover:border-indigo-500/50 hover:bg-zinc-800/40 cursor-pointer transition-all disabled:opacity-50 text-left w-full group"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-white capitalize">{role.toLowerCase()}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">{getRoleLabel(role)}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            {isSettingRole && (
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Menyiapkan dasbor Anda...
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-zinc-950">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/50 backdrop-blur-md shadow-2xl shadow-indigo-500/5">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Masuk ke SEAPEDIA
          </CardTitle>
          <CardDescription className="text-zinc-400 text-sm">
            Gunakan username dan password Anda yang sudah terdaftar.
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
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
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
                  placeholder="Masukkan password"
                  className="pl-10 border-zinc-800 bg-zinc-900/50 text-white placeholder-zinc-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isSettingRole}
              className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-indigo-500/20"
            >
              {isSubmitting || isSettingRole ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-zinc-800/50 p-4">
          <p className="text-zinc-400 text-xs">
            Belum punya akun?{' '}
            <Link href="/register" className="text-indigo-400 hover:underline font-semibold">
              Daftar sekarang
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center bg-zinc-950 min-h-[50vh] text-zinc-500">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mr-2" />
          <span>Memuat halaman masuk...</span>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
