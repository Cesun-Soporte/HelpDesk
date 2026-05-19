import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Send, ArrowLeft, Clock, User, MessageSquare, History, RotateCcw } from 'lucide-react';
import Navbar from '../components/Navbar';

function TicketDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [reopening, setReopening] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const messagesEndRef = useRef(null);

  const calculateMetrics = useCallback((ticketData) => {
    if (ticketData.firstResponseAt) {
      const responseTime = new Date(ticketData.firstResponseAt) - new Date(ticketData.createdAt);
      const hours = Math.floor(responseTime / (1000 * 60 * 60));
      const minutes = Math.floor((responseTime % (1000 * 60 * 60)) / (1000 * 60));
      setMetrics({
        responseTimeFormatted: `${hours}h ${minutes}m`,
        firstResponseAt: ticketData.firstResponseAt
      });
    }
  }, []);

  const fetchTicket = useCallback(async () => {
    try {
      const response = await axios.get(`/api/tickets/${id}`);
      setTicket(response.data);
      calculateMetrics(response.data);
    } catch (error) {
      console.error('Error fetching ticket:', error);
    }
  }, [id, calculateMetrics]);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await axios.get(`/api/tickets/${id}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [id]);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await axios.get(`/api/tickets/${id}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();
    fetchMessages();
    fetchHistory();

    const newSocket = io('http://localhost:5000');

    newSocket.on('connect', () => {
      newSocket.emit('join_ticket', id);
    });

    newSocket.on('new_message', (data) => {
      if (data.ticketId === id) {
        setMessages(prev => [...prev, data]);
        fetchHistory();
      }
    });

    return () => {
      newSocket.emit('leave_ticket', id);
      newSocket.disconnect();
    };
  }, [id, fetchTicket, fetchMessages, fetchHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post(`/api/tickets/${id}/messages`, { message: newMessage });
      setNewMessage('');
    } catch (error) {
      alert('Error enviando mensaje: ' + error.message);
    }
  };

  const handleStatusChange = (newStatus) => {
    setPendingStatusChange(newStatus);
    setShowConfirmDialog(true);
  };

  const confirmStatusChange = async () => {
    setShowConfirmDialog(false);
    try {
      await axios.patch(`/api/tickets/${id}`, { status: pendingStatusChange });
      setTicket({ ...ticket, status: pendingStatusChange });
      fetchHistory();
    } catch (error) {
      alert('Error actualizando ticket: ' + error.message);
    } finally {
      setPendingStatusChange(null);
    }
  };

  const handleReopenTicket = async () => {
    if (!window.confirm('¿Estás seguro de que deseas reabrir este ticket?')) return;

    setReopening(true);
    try {
      await axios.post(`/api/tickets/${id}/reopen`);
      setTicket({ ...ticket, status: 'abierto' });
      fetchHistory();
      alert('Ticket reabierto exitosamente');
    } catch (error) {
      alert('Error reabriendo ticket: ' + (error.response?.data?.error || error.message));
    } finally {
      setReopening(false);
    }
  };

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Cargando ticket...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'abierto': return 'bg-blue-100 text-blue-800';
      case 'en proceso': return 'bg-purple-100 text-purple-800';
      case 'cerrado': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{ticket.title}</h1>
                  <p className="text-gray-600 mt-1">ID: {ticket.id.substring(0, 12)}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">Categoría</p>
                  <p className="font-semibold text-gray-800">{ticket.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Prioridad</p>
                  <p className="font-semibold text-gray-800">{ticket.priority}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Creado por</p>
                  <p className="font-semibold text-gray-800">{ticket.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipo de usuario</p>
                  <p className="font-semibold text-gray-800 capitalize">{ticket.role}</p>
                </div>
              </div>

              {user.role === 'admin' && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Cambiar Estado</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleStatusChange('abierto')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        ticket.status === 'abierto'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      Abierto
                    </button>
                    <button
                      onClick={() => handleStatusChange('en proceso')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        ticket.status === 'en proceso'
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                      }`}
                    >
                      En Proceso
                    </button>
                    <button
                      onClick={() => handleStatusChange('cerrado')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        ticket.status === 'cerrado'
                          ? 'bg-green-600 text-white'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      Cerrado
                    </button>
                    <button
                      onClick={() => handleStatusChange('cancelado')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        ticket.status === 'cancelado'
                          ? 'bg-red-600 text-white'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      Cancelado
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex gap-4 mb-4 border-b">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`pb-3 px-2 font-medium transition ${
                    activeTab === 'chat'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-3 px-2 font-medium transition ${
                    activeTab === 'history'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <History className="w-4 h-4 inline mr-2" />
                  Historial
                </button>
              </div>

              {activeTab === 'chat' && (
                <>
                  <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-4 space-y-4">
                    {messages.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No hay mensajes aún</p>
                    ) : (
                      messages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.userId === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              msg.userId === user.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            <p className="text-sm font-semibold mb-1">{msg.name}</p>
                            <p className="text-sm">{msg.message}</p>
                            <p className={`text-xs mt-1 ${msg.userId === user.id ? 'text-blue-100' : 'text-gray-600'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {ticket.status === 'cerrado' ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <p className="text-red-800 font-semibold">
                        ❌ Este ticket está cerrado
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        No se pueden enviar mensajes en tickets cerrados
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe tu mensaje..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition"
                      >
                        <Send className="w-4 h-4" />
                        Enviar
                      </button>
                    </form>
                  )}
                </>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No hay historial aún</p>
                  ) : (
                    history.map((item, idx) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          {idx < history.length - 1 && <div className="w-0.5 h-12 bg-gray-300 mt-2"></div>}
                        </div>
                        <div className="pb-4">
                          <p className="font-semibold text-gray-800">{item.action === 'status_change' ? 'Cambio de estado' : item.action === 'message' ? 'Mensaje' : 'Reabierto'}</p>
                          {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                          {item.oldStatus && item.newStatus && (
                            <p className="text-sm text-gray-600">
                              {item.oldStatus} → <span className="font-semibold">{item.newStatus}</span>
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <User className="w-3 h-3" />
                            {item.name}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-20 space-y-4">
              <h3 className="text-lg font-bold text-gray-800">Información</h3>

              <div className="space-y-3 border-b pb-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Solicitante</p>
                    <p className="font-semibold text-gray-800">{ticket.name}</p>
                    {ticket.area && (
                      <p className="text-xs text-gray-500 mt-1">
                        <strong>Área:</strong> {ticket.area}
                      </p>
                    )}
                    {ticket.puesto && (
                      <p className="text-xs text-gray-500">
                        <strong>Puesto:</strong> {ticket.puesto}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Creado</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {metrics && (
                <div className="space-y-3 border-b pb-4">
                  <h4 className="font-semibold text-gray-800 text-sm">Tiempos de Respuesta</h4>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                    <p className="text-xs text-gray-600">Primera respuesta</p>
                    <p className="font-semibold text-blue-900">
                      {metrics.responseTimeFormatted}
                    </p>
                    {metrics.firstResponseAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(metrics.firstResponseAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                    <p className="text-xs text-gray-600">Tiempo de resolución</p>
                    <p className="font-semibold text-green-900">
                      {metrics.resolutionTimeFormatted}
                    </p>
                    {metrics.closedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(metrics.closedAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {metrics.reopenedAt && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                      <p className="text-xs text-gray-600">Reabierto</p>
                      <p className="text-xs text-gray-500">
                        {new Date(metrics.reopenedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                <p className="text-sm text-blue-900">
                  <strong>Mensajes:</strong> {messages.length}
                </p>
              </div>

              {ticket.attendedBy && (
                <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                  <p className="text-sm text-green-900">
                    <strong>Atendido por:</strong> {ticket.attendedBy}
                  </p>
                </div>
              )}

              {ticket.assignedTo && (
                <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
                  <p className="text-sm text-purple-900">
                    <strong>Asignado a:</strong> {ticket.assignedTo}
                  </p>
                </div>
              )}

              {ticket.status === 'cancelado' && (
                <button
                  onClick={handleReopenTicket}
                  disabled={reopening}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  {reopening ? 'Reabriendo...' : 'Reabrir Ticket'}
                </button>
              )}
            </div>
          </div>
        </div>

        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Confirmar Cambio de Estado</h3>
              
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas cambiar el estado de <strong>{ticket.title}</strong> a <strong>{pendingStatusChange}</strong>?
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Estado actual:</strong> {ticket.status}
                </p>
                <p className="text-sm text-yellow-800 mt-1">
                  <strong>Nuevo estado:</strong> {pendingStatusChange}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setPendingStatusChange(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmStatusChange}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TicketDetail;
