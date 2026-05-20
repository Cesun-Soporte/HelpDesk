import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Edit2, Save, X, Upload, Download, CheckCircle, Search } from 'lucide-react';
import Navbar from '../components/Navbar';

function UserManagement({ user }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState('');
  const [importResults, setImportResults] = useState(null);
  const [importMode, setImportMode] = useState('paste');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('todos');

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
      name: userData.name || '',
      role: userData.role,
      departamento: userData.departamento || '',
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

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const users = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(',').map(v => v.trim());
      const userData = {};
      headers.forEach((header, idx) => {
        userData[header] = values[idx] || '';
      });
      users.push(userData);
    }
    return users;
  };

  const handleImport = async () => {
    try {
      setError('');
      setSuccess('');
      const parsedUsers = parseCSV(importData);

      if (parsedUsers.length === 0) {
        setError('No se encontraron usuarios en el CSV');
        return;
      }

      const response = await axios.post('/api/admin/users/import', { users: parsedUsers });
      setImportResults(response.data);
      setSuccess(`Importación completada: ${response.data.created} creados, ${response.data.updated} actualizados`);
      setImportData('');
      fetchUsers();
      setTimeout(() => {
        setShowImport(false);
        setImportResults(null);
      }, 3000);
    } catch (err) {
      setError('Error importando usuarios: ' + (err.response?.data?.error || err.message));
    }
  };

  const downloadTemplate = () => {
    const template = 'email,rol,departamento,puesto\njuan@cesun.edu.mx,estudiante,,\nmaria@cesun.edu.mx,docente,Academico,Profesor\nadmin@cesun.edu.mx,administrativo,Sistemas,Coordinador\ncoord.ti@cesun.edu.mx,admin,TI,Jefe de TI\n';
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(template));
    element.setAttribute('download', 'usuarios_template.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadExistingUsers = () => {
    if (users.length === 0) {
      alert('No hay usuarios para descargar');
      return;
    }

    const headers = ['email', 'nombre', 'rol', 'departamento', 'puesto'];
    const csvContent = [
      headers.join(','),
      ...users.map(u => [
        u.email,
        u.name || '',
        u.role,
        u.departamento || '',
        u.puesto || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `usuarios_cesun_${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleFileUpload = async (e) => {
    try {
      setError('');
      setSuccess('');
      const file = e.target.files[0];
      
      if (!file) {
        setError('No se seleccionó archivo');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/admin/users/import-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setImportResults(response.data);
      setSuccess(`Importación completada: ${response.data.created} creados, ${response.data.updated} actualizados`);
      fetchUsers();
      setTimeout(() => {
        setShowImport(false);
        setImportResults(null);
        setImportMode('paste');
      }, 3000);
    } catch (err) {
      setError('Error importando archivo: ' + (err.response?.data?.error || err.message));
    }
  };

  const getFilteredUsers = () => {
    let filtered = users;

    if (filterRole !== 'todos') {
      filtered = filtered.filter(u => u.role === filterRole);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        (u.name && u.name.toLowerCase().includes(search)) ||
        (u.email && u.email.toLowerCase().includes(search)) ||
        (u.role && u.role.toLowerCase().includes(search)) ||
        (u.departamento && u.departamento.toLowerCase().includes(search)) ||
        (u.puesto && u.puesto.toLowerCase().includes(search))
      );
    }

    return filtered;
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Usuarios</h1>
              <p className="text-gray-600">Asigna roles, áreas y puestos a los usuarios</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                title="Descargar template de ejemplo con datos completos"
              >
                <Download className="w-5 h-5" />
                Template
              </button>
              <button
                onClick={downloadExistingUsers}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
                title="Descargar todos los usuarios existentes en CSV"
              >
                <Download className="w-5 h-5" />
                Descargar Usuarios
              </button>
              <button
                onClick={() => setShowImport(!showImport)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Upload className="w-5 h-5" />
                Importar CSV
              </button>
            </div>
          </div>
        </div>

        {showImport && (
          <div className="bg-white rounded-lg shadow p-6 mb-6 border-2 border-blue-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Importar Usuarios</h2>
            
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setImportMode('paste')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  importMode === 'paste'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📋 Pegar CSV
              </button>
              <button
                onClick={() => setImportMode('file')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  importMode === 'file'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📁 Cargar Archivo
              </button>
            </div>

            {importMode === 'paste' ? (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pega el contenido del CSV (email, rol, departamento, puesto):
                  </label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="email,rol,departamento,puesto&#10;juan@cesun.edu.mx,estudiante,,&#10;maria@cesun.edu.mx,docente,,"
                    className="w-full h-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleImport}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Importar
                  </button>
                  <button
                    onClick={() => {
                      setShowImport(false);
                      setImportData('');
                      setImportResults(null);
                    }}
                    className="flex items-center gap-2 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecciona archivo CSV:
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => {
                    setShowImport(false);
                    setImportResults(null);
                  }}
                  className="flex items-center gap-2 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                  Cancelar
                </button>
              </div>
            )}

            {importResults && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Resultados de Importación:</h3>
                <p className="text-blue-800">✅ Creados: {importResults.created}</p>
                <p className="text-blue-800">✏️ Actualizados: {importResults.updated}</p>
                {importResults.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-red-800 font-semibold">❌ Errores:</p>
                    {importResults.errors.map((err, idx) => (
                      <p key={idx} className="text-red-700 text-sm">{err.email}: {err.error}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email, rol, área o puesto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Rol</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="admin">Admin</option>
                <option value="docente">Docente</option>
                <option value="estudiante">Estudiante</option>
                <option value="administrativo">Administrativo</option>
              </select>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Mostrando {getFilteredUsers().length} de {users.length} usuarios
          </p>
        </div>

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
                {getFilteredUsers().length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No hay usuarios que coincidan con los criterios de búsqueda
                    </td>
                  </tr>
                ) : (
                  getFilteredUsers().map((userData) => (
                    <tr key={userData.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {editingId === userData.id ? (
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            placeholder="Nombre"
                            className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          userData.name || '-'
                        )}
                      </td>
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
                            value={editData.departamento}
                            onChange={(e) => setEditData({ ...editData, departamento: e.target.value })}
                            placeholder="Ej: Sistemas"
                            className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <span className="text-gray-600">{userData.departamento || '-'}</span>
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
                  ))
                )}
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
