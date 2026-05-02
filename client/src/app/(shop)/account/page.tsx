'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { Camera, Mail, Save, Upload, MapPin, Package, Star } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth';
import { useOrders } from '@/hooks/use-orders';
import { useAuth } from '@/providers/auth-provider';
import { ROUTES } from '@/lib/constants';
import { formatDate, formatPrice } from '@/lib/utils';
import { profileService } from '@/services/profile.service';
import { useMutation } from '@tanstack/react-query';
import { showToast } from '@/lib/toast';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function AccountPage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: ordersData } = useOrders({
    page: 1,
    limit: 4,
    sort: 'newest',
  });

  const updateProfile = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      showToast.success('Profile updated successfully');
    },
    onError: (err: any) => {
      showToast.error(err.message || 'Failed to update profile');
    }
  });

  if (!user) return null;

  const recentOrders = ordersData?.data ?? [];
  const initials = getInitials(user.name);

  const handleSave = () => {
    updateProfile.mutate({ name, phone });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast.error('Image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateProfile.mutate({ avatar: base64 });
    };
    reader.readAsDataURL(file);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto space-y-12 pt-32 pb-24 p-6 md:p-8">
        
        {/* HEADER */}
        <div>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight text-[#18181B]">My Account</h1>
          <p className="mt-2 text-[#71717a] max-w-lg">
            Manage your profile, tracking preferences, and view your recent verified purchases.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          {/* LEFT: PORTRAIT / UPLOAD */}
          <section className="space-y-6">
            <div className="card p-6 border-[#e4e4e7] flex flex-col items-center">
              <div className="relative w-40 h-40 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-[#16a34a]/20 to-[#22c55e]/20 flex items-center justify-center overflow-hidden mb-6">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <span className="font-heading text-5xl font-bold text-[#16a34a]">{initials}</span>
                )}
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={updateProfile.isPending}
                className="w-full btn-primary !py-2.5 gap-2 text-sm"
              >
                <Upload className="w-4 h-4" />
                {updateProfile.isPending ? 'Updating...' : 'Upload Photo'}
              </button>
            </div>

            <div className="card p-6 space-y-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#a1a1aa] mb-1">Email Address</p>
                <div className="flex items-center gap-2 text-sm font-medium text-[#18181B]">
                  <Mail className="w-4 h-4 text-[#16a34a]" /> {user.email}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#a1a1aa] mb-1">Role</p>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#16a34a]/10 text-[#16a34a]">
                  {user.role}
                </span>
              </div>
            </div>
          </section>

          {/* RIGHT: EDITABLE FORM & ORDERS */}
          <section className="space-y-8">
            <div className="card p-6 md:p-8">
              <div className="flex items-center justify-between border-b border-[#e4e4e7] pb-5 mb-6">
                <div>
                  <h2 className="font-heading text-xl font-bold text-[#18181B]">Personal Info</h2>
                  <p className="text-xs text-[#71717a] mt-1">Update your contact details</p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={updateProfile.isPending || (name === user.name && phone === user.phone)}
                  className="btn-primary !px-5 !py-2 text-xs gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#a1a1aa]">Full Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 rounded-lg border border-[#e4e4e7] bg-white px-4 text-sm outline-none focus:border-[rgba(22,163,74,0.4)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.08)] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#a1a1aa]">Phone Number</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full h-11 rounded-lg border border-[#e4e4e7] bg-white px-4 text-sm outline-none focus:border-[rgba(22,163,74,0.4)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.08)] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* RECENT ORDERS */}
            <div className="card p-6 md:p-8">
               <div className="flex items-center justify-between border-b border-[#e4e4e7] pb-5 mb-6">
                <div>
                  <h2 className="font-heading text-xl font-bold text-[#18181B]">Recent Orders</h2>
                  <p className="text-xs text-[#71717a] mt-1">Track and manage your purchases</p>
                </div>
                <Link
                  href={ROUTES.orders}
                  className="text-xs font-semibold text-[#16a34a] hover:underline underline-offset-4"
                >
                  View all →
                </Link>
              </div>

              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 bg-[#f4f4f5] rounded-xl border border-dashed border-[#d4d4d8]">
                    <Package className="w-8 h-8 text-[#a1a1aa] mb-3" />
                    <p className="text-sm font-medium text-[#71717a]">No orders yet</p>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <Link
                      key={order._id}
                      href={ROUTES.order(order._id)}
                      className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-[#e4e4e7] hover:border-[rgba(22,163,74,0.3)] hover:shadow-md hover:bg-[#f0fdf4]/50 transition-all gap-4"
                    >
                      <div>
                        <p className="text-sm font-bold text-[#18181B] group-hover:text-[#16a34a] transition-colors">{order.orderNumber}</p>
                        <p className="text-xs text-[#71717a] mt-1">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="font-mono text-sm font-semibold text-[#18181B]">
                          {formatPrice(order.totalAmount)}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'delivered' ? 'bg-[#16a34a]/10 text-[#16a34a]' : 'bg-[#f59e0b]/10 text-[#f59e0b]'
                        }`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}
