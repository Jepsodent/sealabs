'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, Role } from '@/context/auth-context';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Menu, X, User as UserIcon, Shield, ChevronDown, LogOut, ShoppingCart, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function Navbar() {
  const { user, logout, updateActiveRole } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await api.get('/cart');
      return response.data;
    },
    enabled: !!user && user.activeRole === 'BUYER',
  });

  const handleRoleChange = async (role: Role) => {
    try {
      await updateActiveRole(role);
      toast.success(`Role aktif diubah menjadi ${role}`);
    } catch (error) {
      toast.error('Gagal mengubah role aktif');
    }
  };

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/products', label: 'Produk' },
  ];

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'SELLER':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'DRIVER':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'BUYER':
        default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-xl font-bold tracking-wider text-transparent">
              SEAPEDIA
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-white ${
                    isActive ? 'text-white font-semibold' : 'text-zinc-400'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {user && (
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-white ${
                  pathname.startsWith('/dashboard') ? 'text-white font-semibold' : 'text-zinc-400'
                }`}
              >
                Dasbor
              </Link>
            )}
          </nav>
        </div>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {/* Role Selector */}
              {user.roles.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      "h-9 border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2 cursor-pointer outline-none"
                    )}
                  >
                    <Shield className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs uppercase font-semibold">
                      Role: {user.activeRole || 'Pilih Role'}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 border-zinc-800 bg-zinc-900 text-zinc-300">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-zinc-500 text-xs">Pilih Peran Aktif</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-zinc-800" />
                      {user.roles.map((role) => (
                        <DropdownMenuItem
                          key={role}
                          onClick={() => handleRoleChange(role)}
                          className={`flex items-center justify-between cursor-pointer focus:bg-zinc-800 focus:text-white ${
                            user.activeRole === role ? 'bg-zinc-800/50 text-white font-semibold' : ''
                          }`}
                        >
                          <span className="capitalize">{role.toLowerCase()}</span>
                          {user.activeRole === role && (
                            <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-full ${getRoleBadgeColor(role)}`}>
                              Aktif
                            </span>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {user.activeRole === 'BUYER' && (
                <Link
                  href="/cart"
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'icon' }),
                    "relative h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 p-0 text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center justify-center cursor-pointer"
                  )}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {cartData?.totalQuantity > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-650 text-[9px] font-bold text-white shadow-md">
                      {cartData.totalQuantity}
                    </span>
                  )}
                </Link>
              )}

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    "relative h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 p-0 text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center justify-center cursor-pointer outline-none"
                  )}
                >
                  <UserIcon className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-zinc-800 bg-zinc-900 text-zinc-300">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                    <p className="text-xs text-zinc-500 truncate">SEAPEDIA Member</p>
                  </div>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer p-0">
                    <Link href="/dashboard" className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-zinc-300 hover:text-white">
                      <Shield className="h-4 w-4 text-zinc-400" />
                      <span>Dasbor Saya</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.activeRole === 'BUYER' && (
                    <>
                      <DropdownMenuSeparator className="bg-zinc-800" />
                      <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer p-0">
                        <Link href="/orders" className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-zinc-300 hover:text-white">
                          <ClipboardList className="h-4 w-4 text-zinc-400" />
                          <span>Pesanan Saya</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="focus:bg-rose-950 focus:text-rose-400 text-rose-400 cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  "text-zinc-400 hover:text-white"
                )}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: 'sm' }),
                  "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg shadow-indigo-500/20"
                )}
              >
                Daftar
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 py-4 space-y-4">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-sm font-medium transition-colors hover:text-white ${
                  pathname === link.href ? 'text-white' : 'text-zinc-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-sm font-medium transition-colors hover:text-white ${
                  pathname.startsWith('/dashboard') ? 'text-white' : 'text-zinc-400'
                }`}
              >
                Dasbor
              </Link>
            )}
          </nav>

          <DropdownMenuSeparator className="bg-zinc-900" />

          {user ? (
            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold text-white">{user.username}</p>
                <p className="text-xs text-zinc-500">Peran Aktif: <span className="font-bold text-indigo-400">{user.activeRole || 'Belum dipilih'}</span></p>
              </div>

              {/* Mobile Role Switcher */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-semibold uppercase">Ganti Peran</label>
                <div className="grid grid-cols-2 gap-2">
                  {user.roles.map((role) => (
                    <Button
                      key={role}
                      size="sm"
                      variant={user.activeRole === role ? 'default' : 'outline'}
                      onClick={() => {
                        handleRoleChange(role);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`text-xs capitalize ${
                        user.activeRole === role 
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                          : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      {role.toLowerCase()}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-rose-950/40 border border-rose-900/60 hover:bg-rose-950 text-rose-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  "w-full border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-850 hover:text-white flex items-center justify-center"
                )}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  buttonVariants({ size: 'sm' }),
                  "w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white flex items-center justify-center"
                )}
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
