const router = require('express').Router();
const { google } = require('googleapis');
const { pool } = require('../config/database');
const { isAuthenticated } = require('../middlewares/auth');

const getOAuthClient = (user) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );
  oauth2Client.setCredentials({
    access_token: user.access_token,
    refresh_token: user.refresh_token,
  });
  return oauth2Client;
};

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const auth = getOAuthClient(req.user);
    const calendar = google.calendar({ version: 'v3', auth });

    const now = new Date();
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: oneMonthLater.toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    res.json(response.data.items || []);
  } catch (err) {
    res.status(500).json({ error: 'Error conectando con Google Calendar: ' + err.message });
  }
});

router.post('/', isAuthenticated, async (req, res) => {
  const { client_id, title, description, start_time, end_time, location } = req.body;
  if (!title || !start_time || !end_time) {
    return res.status(400).json({ error: 'Título, inicio y fin son requeridos' });
  }

  try {
    const auth = getOAuthClient(req.user);
    const calendar = google.calendar({ version: 'v3', auth });

    console.log('start_time:', start_time);
    console.log('end_time:', end_time);
    console.log('start ISO:', new Date(start_time).toISOString());
    console.log('end ISO:', new Date(end_time).toISOString());

    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: title,
        description: description || '',
        location: location || '',
        start: { dateTime: new Date(start_time).toISOString(), timeZone: 'America/Mexico_City' },
        end: { dateTime: new Date(end_time).toISOString(), timeZone: 'America/Mexico_City' },
        colorId: '2',
      },
    });

    const [result] = await pool.query(
      `INSERT INTO sessions (coach_id, client_id, google_event_id, title, description, start_time, end_time, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, client_id || null, event.data.id, title, description, start_time, end_time, location]
    );

    const [rows] = await pool.query('SELECT * FROM sessions WHERE id = ?', [result.insertId]);
    res.status(201).json({ session: rows[0], googleEvent: event.data });
  } catch (err) {
    res.status(500).json({ error: 'Error creando evento: ' + err.message });
  }
});

router.delete('/:eventId', isAuthenticated, async (req, res) => {
  try {
    const auth = getOAuthClient(req.user);
    const calendar = google.calendar({ version: 'v3', auth });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: req.params.eventId,
    });

    await pool.query(
      'UPDATE sessions SET status = ? WHERE google_event_id = ? AND coach_id = ?',
      ['cancelled', req.params.eventId, req.user.id]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error cancelando evento: ' + err.message });
  }
});

module.exports = router;