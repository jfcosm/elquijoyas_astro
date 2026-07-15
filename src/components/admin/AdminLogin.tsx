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
      // Redirección manejada por el onAuthStateChanged o forzada
      window.location.href = '/admin';
    } catch (err: any) {
      console.error(err);
      setError('Usuario o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sand via-clay to-sand px-4">
      <div className="absolute -inset-10 bg-gold/10 blur-3xl rounded-full max-w-lg mx-auto pointer-events-none"></div>
      
      <div className="w-full max-w-md card p-8 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold font-bold text-2xl mx-auto">
            EJ
          </div>
          <h1 className="text-3xl font-serif font-semibold text-neutral-900">Panel de Control</h1>
          <p className="text-sm text-neutral-600">Acceso exclusivo para Nicolás Cordero</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 animate-pulse">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="username">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white/80 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold transition duration-200"
              placeholder="Nombre de usuario"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white/80 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold transition duration-200"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full button-primary mt-2"
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
              'Ingresar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
