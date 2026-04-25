import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Car, RefreshCw } from 'lucide-react';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const fb = searchParams.get('fb');
    const ig = searchParams.get('ig');
    const google = searchParams.get('google');
    const platform = searchParams.get('platform');

    const message = success
      ? { type: 'oauth_success', fb, ig, google, platform }
      : { type: 'oauth_error', error, platform };

    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage(message, window.location.origin);
      } catch {
        // opener may be from a cross-origin navigation or already closed
      }
      window.close();
      return;
    }

    // Popup was blocked or user navigated here directly — redirect back to /accounts
    const params = new URLSearchParams();
    if (success) params.set('success', 'true');
    if (error) params.set('error', error);
    if (fb) params.set('fb', fb);
    if (ig) params.set('ig', ig);
    if (google) params.set('google', google);
    window.location.replace(`/accounts?${params}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#141824] to-[#1a1f2e] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-orange-500/30">
          <Car className="w-8 h-8 text-white" />
        </div>
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Completing connection…
        </div>
      </div>
    </div>
  );
}
