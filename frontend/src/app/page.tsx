'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, ShoppingBag, Truck, Store, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';

// Review schema definition
const reviewSchema = z.object({
  reviewerName: z.string().optional(),
  rating: z.number().min(1, 'Rating minimal 1').max(5, 'Rating maksimal 5'),
  comment: z.string().min(3, 'Ulasan minimal 3 karakter'),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function HomePage() {
  const queryClient = useQueryClient();
  const {user} = useAuth()
  // Fetch reviews query
  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: ['reviews'],
    queryFn: async () => {
      const response = (await api.get<Review[]>('/reviews'));
      return response.data;
    },
    select: (data) => data.slice(0,5)
  });

  // Post review mutation
  const postReviewMutation = useMutation({
    mutationFn: async (newReview: ReviewFormValues) => {
      const response = await api.post('/reviews', newReview);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Ulasan Anda berhasil dikirim!');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      reset();
    },
    onError: () => {
      toast.error('Gagal mengirim ulasan.');
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      reviewerName: user?.username || '',
      rating: 5,
      comment: '',
    },
  });

  const currentRating = watch('rating');

  const onSubmit = (data: ReviewFormValues) => {
    postReviewMutation.mutate({
      ...data,
      reviewerName: data.reviewerName?.trim() || 'Guest',
    });
  };

  return (
    <div className="flex flex-col w-full bg-zinc-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32 border-b border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="h-3.5 w-3.5" /> SEAPEDIA 
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Marketplace Terbagus Sedunia 
            </h1>
            <p className="text-lg text-zinc-400 leading-8">
              Satu ekosistem belanja premium untuk semua orang. Masuk sebagai Pembeli, berjualan sebagai Penjual, atau dapatkan penghasilan sebagai Driver pengiriman.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/products"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium px-8 shadow-xl shadow-indigo-500/10 flex items-center gap-2"
                )}
              >
                Jelajahi Produk <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'outline' }),
                  "border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white px-8"
                )}
              >
                Mulai Sekarang
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-20 border-b border-zinc-800/60 bg-zinc-900/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Satu Platform, Banyak Peran</h2>
            <p className="text-zinc-400 text-sm">Kemudahan akses navigasi dan alur transaksi yang disesuaikan untuk kebutuhan Anda.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-zinc-800 bg-zinc-900/30 backdrop-blur-sm p-6 space-y-4 hover:border-blue-500/30 transition-all">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Pembeli (Buyer)</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Jelajahi berbagai katalog produk menarik dari banyak toko berbeda, kumpulkan dalam keranjang, dan nikmati kemudahan bertransaksi secara aman.
              </p>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900/30 backdrop-blur-sm p-6 space-y-4 hover:border-emerald-500/30 transition-all">
              <div className="h-12 w-12 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Penjual (Seller)</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Kelola inventaris toko Anda sendiri, pajang produk-produk terbaik, atur harga, dan dapatkan pendapatan langsung dari penjualan produk Anda.
              </p>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900/30 backdrop-blur-sm p-6 space-y-4 hover:border-amber-500/30 transition-all">
              <div className="h-12 w-12 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Kurir (Driver)</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Daftarkan diri Anda untuk mengambil orderan pengiriman barang, antarkan dengan aman ke pembeli, dan raih komisi di setiap pengiriman sukses.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Reviews & Feedback Section */}
      <section className="py-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Review List */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-indigo-400" /> Ulasan Aplikasi
              </h2>
              <p className="text-zinc-400 text-sm">Ulasan dan testimoni langsung dari pengguna situs SEAPEDIA.</p>
            </div>

            {isLoadingReviews ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-28 rounded-lg bg-zinc-900/50 animate-pulse border border-zinc-800" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 border border-zinc-800 border-dashed rounded-xl bg-zinc-900/20 text-zinc-500">
                <MessageSquare className="h-10 w-10 mb-2 opacity-50" />
                <p className="text-sm font-semibold">Belum ada ulasan</p>
                <p className="text-xs text-zinc-500">Jadilah yang pertama mengirimkan ulasan mengenai website kami!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {reviews.map((review) => (
                  <Card key={review.id} className="border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4">
                      <div>
                        <CardTitle className="text-sm font-bold text-white">{review.reviewerName}</CardTitle>
                        <span className="text-[10px] text-zinc-500">
                          {new Date(review.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'
                            }`}
                          />
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0">
                      {/* Secure plain-text render to protect against XSS */}
                      <p className="text-sm text-zinc-300 leading-relaxed break-words whitespace-pre-wrap">
                        {review.comment}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Review Form */}
          <div className="lg:col-span-5">
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">Beri Nilai Kami</CardTitle>
                <CardDescription className="text-zinc-400 text-xs">
                  Bagikan masukan dan ulasan Anda tentang pengalaman menggunakan situs SEAPEDIA.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Reviewer Name */}
                  <div className="space-y-2">
                    <Label htmlFor="reviewerName" className="text-zinc-300 text-xs font-semibold uppercase tracking-wider">
                      Nama Pengulas
                    </Label>
                    <Input
                      id="reviewerName"
                      type="text"
                      placeholder="Guest (Opsional)"
                      className="border-zinc-800 bg-zinc-900/50 text-white placeholder-zinc-500 focus-visible:ring-indigo-500"
                      {...register('reviewerName')}
                    />
                    {errors.reviewerName && (
                      <p className="text-xs text-rose-500 font-medium">{errors.reviewerName.message}</p>
                    )}
                  </div>

                  {/* Rating Selector */}
                  <div className="space-y-2">
                    <Label className="text-zinc-300 text-xs font-semibold uppercase tracking-wider block">
                      Rating: {currentRating} / 5
                    </Label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setValue('rating', star, { shouldValidate: true })}
                          className="text-zinc-500 hover:scale-110 transition-transform focus:outline-none"
                        >
                          <Star
                            className={`h-7 w-7 ${
                              star <= currentRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-zinc-700 hover:text-zinc-500'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {errors.rating && (
                      <p className="text-xs text-rose-500 font-medium">{errors.rating.message}</p>
                    )}
                  </div>

                  {/* Comment */}
                  <div className="space-y-2">
                    <Label htmlFor="comment" className="text-zinc-300 text-xs font-semibold uppercase tracking-wider">
                      Komentar Anda
                    </Label>
                    <Textarea
                      id="comment"
                      rows={4}
                      placeholder="Tulis kritik atau saran Anda..."
                      className="border-zinc-800 bg-zinc-900/50 text-white placeholder-zinc-500 focus-visible:ring-indigo-500 resize-none"
                      {...register('comment')}
                    />
                    {errors.comment && (
                      <p className="text-xs text-rose-500 font-medium">{errors.comment.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={postReviewMutation.isPending}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                  >
                    {postReviewMutation.isPending ? 'Mengirim...' : 'Kirim Ulasan'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
