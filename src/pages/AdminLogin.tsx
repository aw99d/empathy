import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, ArrowLeft, Coffee } from 'lucide-react';
import { Logo } from '../components/Logo';

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
  onNavigateHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onNavigateHome,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Authentication failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      localStorage.setItem('empathy_admin_token', data.token);
      onLoginSuccess(data.token);
    } catch {
      setError('Unable to connect to the server. Please check your network.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0E3524] text-[#EBE4D1] px-4 py-8 relative overflow-hidden">
      {/* Background radial glows */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #C4283D 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #E6BD83 0%, transparent 70%)' }}
      />

      {/* Top Bar with back to menu */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between z-10">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#EBE4D1]/80 hover:text-[#EBE4D1] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Menu</span>
        </button>
        <span className="text-[11px] font-mono-tabular tracking-wider uppercase text-[#E6BD83]">
          Staff Portal
        </span>
      </div>

      {/* Main Login Form Container */}
      <div className="max-w-md mx-auto w-full my-auto z-10 pt-4 pb-8">
        <div className="flex flex-col items-center mb-8 text-center">
          <Logo variant="compact" theme="dark" className="mb-4" />
          <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-[#EBE4D1]">
            Menu Administrator
          </h1>
          <p className="text-xs text-[#EBE4D1]/60 mt-1">
            Sign in to manage categories, products, and cafe details
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#15442F]/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-[#EBE4D1]/15 shadow-2xl space-y-5"
        >
          {error && (
            <div className="p-3.5 rounded-xl bg-[#C4283D]/20 border border-[#C4283D]/40 text-[#F9F8F4] text-xs font-medium leading-relaxed">
              {error}
            </div>
          )}

          {/* Username Field */}
          <div>
            <label
              htmlFor="admin-username"
              className="block text-xs font-semibold uppercase tracking-wider text-[#EBE4D1]/80 mb-2"
            >
              Username or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#EBE4D1]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#0E3524] border border-[#EBE4D1]/20 text-[#EBE4D1] placeholder-[#EBE4D1]/40 text-sm focus:outline-none focus:border-[#E6BD83] transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold uppercase tracking-wider text-[#EBE4D1]/80 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#EBE4D1]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full h-11 pl-10 pr-11 rounded-xl bg-[#0E3524] border border-[#EBE4D1]/20 text-[#EBE4D1] placeholder-[#EBE4D1]/40 text-sm focus:outline-none focus:border-[#E6BD83] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#EBE4D1]/60 hover:text-[#EBE4D1] p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#C4283D] hover:bg-[#a82032] active:scale-[0.99] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Coffee className="w-4 h-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>
      </div>

      {/* Footer copyright note */}
      <div className="max-w-md mx-auto w-full text-center text-[11px] text-[#EBE4D1]/40 z-10">
        Empathy Speciality Coffee &copy; {new Date().getFullYear()} · Qidfa, Fujairah
      </div>
    </div>
  );
};
