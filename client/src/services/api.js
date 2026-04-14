import axios from 'axios';
//aqui estoy creando una instancia de axios con la baseURL de la API y configurando para que envie las cookies en cada solicitud, tambien estoy agregando un interceptor para manejar los errores de autenticacion y redirigir al usuario a la pagina de login si recibe un error 401
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// --- CLIENTES ---
export const getClients = () => api.get('/clients').then(r => r.data);
export const getClient = (id) => api.get(`/clients/${id}`).then(r => r.data);
export const createClient = (data) => api.post('/clients', data).then(r => r.data);
export const updateClient = (id, data) => api.put(`/clients/${id}`, data).then(r => r.data);
export const deleteClient = (id) => api.delete(`/clients/${id}`).then(r => r.data);

// --- CALENDARIO ---
export const getCalendarEvents = () => api.get('/calendar').then(r => r.data);
export const createCalendarEvent = (data) => api.post('/calendar', data).then(r => r.data);
export const deleteCalendarEvent = (eventId) => api.delete(`/calendar/${eventId}`).then(r => r.data);