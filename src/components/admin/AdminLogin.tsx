import React, { useState, useEffect } from 'react';
import { auth } from '../../services/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si ya está autenticado, redirigir al panel
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        window.location.href = '/admin';
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validación de usuario Nico
    if (username.trim().toLowerCase() !== 'nico') {
      setError('Usuario o contraseña incorrectos.');
      setLoading(false);
      return;
    }

    try {
      // Login interno con Firebase Auth usando el correo asignado y la contraseña dada
      await signInWithEmailAndPassword(auth, 'nico@elquijoyas.cl', password);
      window.location.href = '/admin';
    } catch (err: any) {
      console.error(err);
      setError('Usuario o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden py-12">
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-emerald-light/50 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-quartz-mist/60 blur-3xl rounded-full pointer-events-none"></div>
      
      <div className="w-full max-w-md card p-8 sm:p-10 space-y-6 relative z-10 bg-white/90 border-[#E8DFC8] shadow-watercolor">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#D4C3AE] shadow-md bg-white p-1 mx-auto">
            <img 
              src="/images/logo-watercolor.jpg" 
              alt="Elqui Joyas Logo Oficial" 
              class="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-ink-deep">Panel de Control</h1>
            <p className="text-xs uppercase tracking-widest text-ink-muted mt-1">Acceso exclusivo · Nicolás Cordero</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5" htmlFor="username">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0]/90 px-4 py-3 text-sm text-ink-deep focus:outline-none focus:ring-2 focus:ring-emerald focus:bg-white transition duration-200"
              placeholder="Ej. nico"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-[#E0CCB4] bg-[#FAF6F0]/90 px-4 py-3 text-sm text-ink-deep focus:outline-none focus:ring-2 focus:ring-emerald focus:bg-white transition duration-200"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full button-primary mt-2 !py-3.5 text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              'Ingresar al Taller ✦'
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <a href="/" className="text-xs text-ink-muted hover:text-emerald transition">
            ← Volver a la portada de la web
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
