'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Shield,
  User,
  Mail,
  Calendar,
  Clock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Chip } from '@/components/ui/chip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatCard } from '@/components/admin';
import { Pagination } from '@/components/shared/pagination';
import { formatDate, formatDateTime } from '@/lib/utils';
import { useAdminUsers } from '@/hooks/use-admin';
import type { User as UserType } from '@/types';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminUsers({
    page,
    limit: 20,
    search: search || undefined,
    role: role || undefined,
  });

  const users = data?.data || [];
  const pagination = data?.pagination;

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-heading">
          User Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View registered customers and administrators
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={pagination?.total ?? '—'}
          icon={Users}
        />
        <StatCard label="Active" value={activeCount} icon={User} variant="success" />
        <StatCard
          label="Admins"
          value={adminCount}
          icon={Shield}
          variant="chain"
        />
        <StatCard
          label="This Page"
          value={users.length}
          icon={Users}
          variant="verified"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-9"
          />
        </div>
        <Select value={role} onValueChange={(v) => { if (v !== null) { setRole(v === 'all' ? '' : v); setPage(1); } }}>
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="hidden lg:grid grid-cols-[1fr_140px_100px_140px_80px] gap-4 border-b bg-muted/50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>User</span>
          <span>Joined</span>
          <span className="text-center">Role</span>
          <span>Last Login</span>
          <span className="text-center">Status</span>
        </div>

        {isLoading ? (
          <div className="divide-y">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse bg-muted/20" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto size-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">No users found</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${search}-${role}-${page}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="divide-y"
            >
              {users.map((user) => (
                <UserRow key={user._id} user={user} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {pagination && pagination.pages > 1 && (
        <Pagination pagination={pagination} onPageChange={setPage} />
      )}
    </div>
  );
}

function UserRow({ user }: { user: UserType }) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="grid grid-cols-1 gap-2 px-5 py-3 hover:bg-muted/30 transition-colors lg:grid-cols-[1fr_140px_100px_140px_80px] lg:gap-4 lg:items-center">
      {/* User */}
      <div className="flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <Mail className="size-3" />
            {user.email}
          </p>
        </div>
      </div>

      {/* Joined */}
      <div className="text-sm text-muted-foreground hidden lg:flex lg:items-center gap-1">
        <Calendar className="size-3" />
        {formatDate(user.createdAt)}
      </div>

      {/* Role */}
      <div className="text-center hidden lg:block">
        {user.role === 'admin' ? (
          <Chip variant="chain" className="text-[10px]">
            <Shield className="size-2.5" />
            Admin
          </Chip>
        ) : (
          <Chip variant="muted" className="text-[10px]">Customer</Chip>
        )}
      </div>

      {/* Last Login */}
      <div className="text-xs text-muted-foreground hidden lg:flex lg:items-center gap-1">
        <Clock className="size-3" />
        {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'}
      </div>

      {/* Status */}
      <div className="text-center hidden lg:block">
        {user.isActive ? (
          <Chip variant="success" className="text-[10px]">Active</Chip>
        ) : (
          <Chip variant="destructive" className="text-[10px]">Disabled</Chip>
        )}
      </div>

      {/* Mobile meta */}
      <div className="flex items-center justify-between lg:hidden text-xs">
        <span className="text-muted-foreground">{formatDate(user.createdAt)}</span>
        {user.role === 'admin' ? (
          <Chip variant="chain" className="text-[10px]">Admin</Chip>
        ) : (
          <Chip variant="muted" className="text-[10px]">Customer</Chip>
        )}
        {user.isActive ? (
          <Chip variant="success" className="text-[10px]">Active</Chip>
        ) : (
          <Chip variant="destructive" className="text-[10px]">Disabled</Chip>
        )}
      </div>
    </div>
  );
}
