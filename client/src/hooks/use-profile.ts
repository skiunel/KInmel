'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/providers/auth-provider';
import {
  profileService,
  type UpdateProfilePayload,
} from '@/services/profile.service';

export function useUpdateProfile() {
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileService.updateProfile(payload),
    onSuccess: (user) => {
      setUser(user);
      toast.success('Profile updated successfully');
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to update profile';
      toast.error(message);
    },
  });
}
