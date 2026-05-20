import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart3, Users, Ticket, TrendingUp, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';

function AdminPanel({ user }) {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get('/api/tickets');
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      setStats(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats([]);
    }
  };

  const getFilteredTickets = () => {
    return tickets.filter(ticket => {
      if (selectedCategory && ticket.category !== selectedCategory) return false;
      if (selectedStatus && ticket.status !== selectedStatus) return false;
      if (selectedRole && ticket.role !== selectedRole) return false;
      return true;
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'abierto': return 'bg-blue-100 text-blue-800';
      case 'atendido': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      case 'retroalimentacion': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'docente': return 'bg-orange-100 text-orange-800';
      case 'estudiante': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = [...new Set(tickets.map(t => t.category))];
  const statuses = ['abierto', 'atendido', 'retroalimentacion', 'cancelado'];
  const roles = ['admin', 'docente', 'estudiante'];

  const filteredTickets = getFilteredTickets();

  const categoryStats = stats.reduce((acc, stat) => {
    const key = stat.category;
    if (!acc[key]) acc[key] = { category: key, total: 0, byStatus: {}, byRole: {} };
    acc[key].total += stat.count;
    acc[key].byStatus[stat.status] = stat.count;
    acc[key].byRole[stat.userRole] = stat.count;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
            >
              <Users className="w-5 h-5" />
              Gestionar Usuarios
            </button>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-800">Total: {tickets.length} tickets</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Abiertos</p>
                <p className="text-3xl font-bold text-blue-600">
                  {tickets.filter(t => t.status === 'abierto').length}
                </p>
              </div>
              <Ticket className="w-10 h-10 text-blue-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Atendidos</p>
                <p className="text-3xl font-bold text-green-600">
                  {tickets.filter(t => t.status === 'atendido').length}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">En Retroalimentación</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {tickets.filter(t => t.status === 'retroalimentacion').length}
                </p>
              </div>
              <Filter className="w-10 h-10 text-yellow-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Cancelados</p>
                <p className="text-3xl font-bold text-red-600">
                  {tickets.filter(t => t.status === 'cancelado').length}
                </p>
              </div>
              <Users className="w-10 h-10 text-red-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Tickets por Rol</h3>
            <div className="space-y-3">
              {roles.map(role => {
                const count = tickets.filter(t => t.role === role).length;
                const percentage = tickets.length > 0 ? (count / tickets.length * 100).toFixed(1) : 0;
                return (
                  <div key={role}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">{role}</span>
                      <span className="text-sm font-semibold text-gray-800">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          role === 'admin' ? 'bg-purple-600' : role === 'docente' ? 'bg-orange-600' : 'bg-cyan-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Tickets por Estado</h3>
            <div className="space-y-3">
              {statuses.map(status => {
                const count = tickets.filter(t => t.status === status).length;
                const percentage = tickets.length > 0 ? (count / tickets.length * 100).toFixed(1) : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                      <span className="text-sm font-semibold text-gray-800">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          status === 'abierto' ? 'bg-blue-600' : status === 'atendido' ? 'bg-green-600' : status === 'retroalimentacion' ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Categorías Principales</h3>
            <div className="space-y-3">
              {Object.entries(categoryStats)
                .sort((a, b) => b[1].total - a[1].total)
                .slice(0, 5)
                .map(([category, data]) => {
                  const percentage = tickets.length > 0 ? (data.total / tickets.length * 100).toFixed(1) : 0;
                  return (
                    <div key={category}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{category}</span>
                        <span className="text-sm font-semibold text-gray-800">{data.total} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-indigo-600"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filtros Avanzados</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Usuario</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Título</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Categoría</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rol Usuario</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Solicitante</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No hay tickets con los filtros seleccionados
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map(ticket => (
                    <tr key={ticket.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{ticket.title}</p>
                        <p className="text-xs text-gray-500">{ticket.id.substring(0, 8)}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{ticket.category}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(ticket.role)}`}>
                          {ticket.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{ticket.name}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/tickets/${ticket.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">
            Mostrando <strong>{filteredTickets.length}</strong> de <strong>{tickets.length}</strong> tickets
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
