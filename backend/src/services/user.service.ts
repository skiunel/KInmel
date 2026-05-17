import { User } from '../models/User';
import { ApiError } from '../utils/api-error';
import type { UpdateProfileInput } from '../validators/user.validators';

export const getProfile = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw ApiError.notFound('User not found');
  }

  return user.toPublicJSON();
};

export const updateProfile = async (
  userId: string,
  input: UpdateProfileInput
) => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw ApiError.notFound('User not found');
  }

  if (input.name !== undefined) {
    user.name = input.name;
  }

  if (input.phone !== undefined) {
    user.phone = input.phone;
  }

  if (input.avatar !== undefined) {
    user.avatar = input.avatar;
  }

  await user.save();

  return user.toPublicJSON();
};
