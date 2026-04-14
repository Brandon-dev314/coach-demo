
//en este archivo se manejan las rutas relacionadas con los clientes
const router = require('express').Router();
const { pool } = require('../config/database');
const { isAuthenticated } = require('../middlewares/auth');


router.get('/', isAuthenticated, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM clients WHERE coach_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, 
        COUNT(s.id) as total_sessions,
        MAX(s.start_time) as last_session
       FROM clients c
       LEFT JOIN sessions s ON s.client_id = c.id
       WHERE c.id = ? AND c.coach_id = ?
       GROUP BY c.id`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', isAuthenticated, async (req, res) => {
  const { name, email, phone, goal, level, weight, height, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'El nombre es requerido' });

  try {
    const [result] = await pool.query(
      `INSERT INTO clients (coach_id, name, email, phone, goal, level, weight, height, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, email, phone, goal, level || 'beginner', weight, height, notes]
    );
    const [rows] = await pool.query('SELECT * FROM clients WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', isAuthenticated, async (req, res) => {
  const { name, email, phone, goal, level, weight, height, notes, active } = req.body;
  try {
    //COALSCE permite actualizar solo los campos que se envían, manteniendo el resto sin cambios
    await pool.query(
      `UPDATE clients SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        goal = COALESCE(?, goal),
        level = COALESCE(?, level),
        weight = COALESCE(?, weight),
        height = COALESCE(?, height),
        notes = COALESCE(?, notes),
        active = COALESCE(?, active)
       WHERE id = ? AND coach_id = ?`,
      [name, email, phone, goal, level, weight, height, notes, active, req.params.id, req.user.id]
    );
    const [rows] = await pool.query('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM clients WHERE id = ? AND coach_id = ?',
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;