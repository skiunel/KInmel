import { toast } from 'sonner';
import { getErrorMessage } from './utils';

export const showToast = {
  success: (message: string) => toast.success(message),
  error: (error: unknown) => toast.error(getErrorMessage(error)),
  info: (message: string) => toast.info(message),
  warning: (message: string) => toast.warning(message),
  loading: (message: string) => toast.loading(message),
  dismiss: (id?: string | number) => toast.dismiss(id),
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error?: string }
  ) =>
    toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error || 'Something went wrong',
    }),
};
