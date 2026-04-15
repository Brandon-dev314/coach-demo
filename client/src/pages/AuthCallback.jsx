import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.location.href = '/dashboard'; 
    } else {
      window.location.href = '/login';
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
      <div className="w-10 h-10 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
