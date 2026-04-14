import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
// en esta parte se crea un contexto de autenticacion para manejar el estado del usuario en toda la aplicacion, se hace una peticion al backend para obtener el usuario autenticado y se guarda en el estado, tambien se define una funcion de logout que hace una peticion al backend para cerrar la sesion y redirige al usuario a la pagina de login
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/auth/me', { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await axios.post('/auth/logout', {}, { withCredentials: true });
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);