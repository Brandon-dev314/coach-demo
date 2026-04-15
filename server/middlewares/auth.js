const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No autenticado.' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Traer el usuario completo de la BD (necesitas access_token para Google Calendar)
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    if (!rows.length) return res.status(401).json({ error: 'Usuario no encontrado.' });
    req.user = rows[0];
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

module.exports = { isAuthenticated };
