import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chrome } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ========================================
// Login Page — Task 2.3
// Email + Password auth via Supabase
// ========================================

export default function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (isSignUp) {
      // Flow de Inregistrare
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Cont creat! Verifică email-ul pentru link-ul de confirmare.');
      }
    } else {
      // Flow de Login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email sau parolă greșită.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Contul nu a fost confirmat. Verifică email-ul.');
        } else {
          setError(error.message);
        }
      } else {
        navigate('/', { replace: true });
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    if (error) setError(error.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo & Title */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary">🎵 MeelMusic</h1>
          <p className="mt-2 text-text-secondary">Muzica voastră, împreună.</p>
        </div>

        {/* Login Form Wrapper */}
        <div className="rounded-2xl bg-[#121212] p-6 shadow-xl border border-[#282828]">
          
          {/* Tabs */}
          <div className="flex bg-black rounded-lg p-1 mb-6">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${!isSignUp ? 'bg-[#282828] text-white' : 'text-[#a7a7a7] hover:text-white'}`}
            >
              Log In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${isSignUp ? 'bg-[#282828] text-white' : 'text-[#a7a7a7] hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleEmailAuth}>
            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-text-secondary"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full rounded-lg border border-white/10 bg-bg-surface px-4 py-2.5 text-text-primary placeholder-text-secondary/50 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-text-secondary"
              >
                Parolă
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-white/10 bg-bg-surface px-4 py-2.5 text-text-primary placeholder-text-secondary/50 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Error / Success messages */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-4 rounded-lg bg-[#1db954]/10 border border-[#1db954]/20 px-4 py-3 text-sm text-[#1db954]">
                {message}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#1db954] py-3 font-bold text-black transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {loading ? 'Se procesează...' : (isSignUp ? 'Creează cont' : 'Intră în cont')}
            </button>
          </form>

          <div className="relative flex items-center py-2 mb-4">
            <div className="flex-grow border-t border-[#282828]"></div>
            <span className="flex-shrink-0 mx-4 text-[#a7a7a7] text-sm">sau</span>
            <div className="flex-grow border-t border-[#282828]"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 rounded-full bg-white border border-gray-300 py-3 font-bold text-black transition-transform hover:scale-105"
          >
            <Chrome size={20} className="text-blue-500" />
            Continuă cu Google
          </button>
        </div>

        {/* Guest Login */}
        <button 
          onClick={() => navigate('/')}
          className="w-full text-center text-sm text-[#a7a7a7] hover:text-white mt-6 underline block"
        >
          Continuă ca Vizitator (Guest)
        </button>

      </div>
    </div>
  );
}
