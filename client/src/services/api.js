import api from '../api/axios';

export const getClients = () => api.get('/api/clients').then(r => r.data);
export const getClient = (id) => api.get(`/api/clients/${id}`).then(r => r.data);
export const createClient = (data) => api.post('/api/clients', data).then(r => r.data);
export const updateClient = (id, data) => api.put(`/api/clients/${id}`, data).then(r => r.data);
export const deleteClient = (id) => api.delete(`/api/clients/${id}`).then(r => r.data);

export const getCalendarEvents = () => api.get('/api/calendar').then(r => r.data);
export const createCalendarEvent = (data) => api.post('/api/calendar', data).then(r => r.data);
export const deleteCalendarEvent = (eventId) => api.delete(`/api/calendar/${eventId}`).then(r => r.data);
