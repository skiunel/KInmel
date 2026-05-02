'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useGoogleLogin } from '@/hooks/use-auth-mutations';
import { GOOGLE_AUTH_ENABLED } from '@/lib/runtime-config';
import { showToast } from '@/lib/toast';

interface GoogleLoginButtonProps {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
}

export function GoogleLoginButton({ theme = 'outline' }: GoogleLoginButtonProps) {
  const googleLogin = useGoogleLogin();

  if (!GOOGLE_AUTH_ENABLED) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={(response) => {
          if (response.credential) {
            googleLogin.mutate(response.credential);
          }
        }}
        onError={() => {
          showToast.error(
            'Google sign-in could not start. Check the Google OAuth client ID configuration.'
          );
        }}
        theme={theme}
        size="large"
        width="100%"
        text="continue_with"
        shape="rectangular"
      />
    </div>
  );
}
