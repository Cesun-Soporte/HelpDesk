import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Edit2, Save, X } from 'lucide-react';
import Navbar from '../components/Navbar';

function UserManagement({ user }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error cargando usuarios: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  const startEdit = (userData) => {
    setEditingId(userData.id);
    setEditData({
      role: userData.role,
      area: userData.area || '',
      puesto: userData.puesto || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (userId) => {
    try {
      setError('');
      setSuccess('');
      await axios.put(`/api/users/${userId}`, editData);
      setSuccess('Usuario actualizado exitosamente');
      setEditingId(null);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error actualizando usuario: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-red-600 font-semibold">No tienes permiso para acceder a esta página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al Panel
        </button>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Usuarios</h1>
          <p className="text-gray-600">Asigna roles, áreas y puestos a los usuarios</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rol</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Área</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Puesto</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userData) => (
                  <tr key={userData.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{userData.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{userData.email}</td>
                    <td className="px-6 py-4 text-sm">
                      {editingId === userData.id ? (
                        <select
                          value={editData.role}
                          onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                          className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="admin">Admin</option>
                          <option value="docente">Docente</option>
                          <option value="estudiante">Estudiante</option>
                          <option value="administrativo">Administrativo</option>
                        </select>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          userData.role === 'admin' ? 'bg-red-100 text-red-800' :
                          userData.role === 'docente' ? 'bg-blue-100 text-blue-800' :
                          userData.role === 'administrativo' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {userData.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {editingId === userData.id ? (
                        <input
                          type="text"
                          value={editData.area}
                          onChange={(e) => setEditData({ ...editData, area: e.target.value })}
                          placeholder="Ej: Sistemas"
                          className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-gray-600">{userData.area || '-'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {editingId === userData.id ? (
                        <input
                          type="text"
                          value={editData.puesto}
                          onChange={(e) => setEditData({ ...editData, puesto: e.target.value })}
                          placeholder="Ej: Coordinador"
                          className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-gray-600">{userData.puesto || '-'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {editingId === userData.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(userData.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center gap-1 transition"
                          >
                            <Save className="w-4 h-4" />
                            Guardar
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded flex items-center gap-1 transition"
                          >
                            <X className="w-4 h-4" />
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(userData)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Información de Roles</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li><strong>Admin:</strong> Acceso total al sistema y gestión de usuarios</li>
            <li><strong>Docente:</strong> Puede crear y ver sus tickets</li>
            <li><strong>Estudiante:</strong> Puede crear y ver sus tickets</li>
            <li><strong>Administrativo:</strong> Trabajador de CESUN, puede crear y ver sus tickets</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
