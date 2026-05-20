import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

function Login({ setUser }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post('/api/auth/google', {
        token: credentialResponse.credential
      });

      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setUser(response.data.user);
      navigate('/dashboard');
    } catch (error) {
      setError('Error en autenticación: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="/logo-cesun.png" 
                alt="CESUN Universidad" 
                className="h-20 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Help Desk CESUN</h1>
            <p className="text-slate-600 mt-1 text-sm">Universidad CESUN</p>
            <p className="text-slate-500 mt-1 text-xs">Sistema de Soporte Institucional</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Error en login con Google')}
              text="signin_with"
              width="300"
            />
          </div>

          <div className="text-center text-sm text-slate-600">
            <p>Usa tu cuenta Google institucional</p>
          </div>
        </div>

        <div className="mt-12 text-center text-white text-xs">
          <p className="text-white text-opacity-80">© 2024 Universidad CESUN</p>
          <p className="text-white text-opacity-70 mt-1">Sistema de Soporte Institucional</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
