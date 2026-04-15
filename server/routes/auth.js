const router = require('express').Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

router.get(
  '/google',
  passport.authenticate('google', {
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/calendar',
    ],
    accessType: 'offline',
    prompt: 'consent',
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
  }),
  (req, res) => {
    // Crear token con datos del usuario
    const token = jwt.sign(
      { id: req.user.id, name: req.user.name, email: req.user.email, avatar: req.user.avatar },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    // Redirigir con token en URL
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

router.get('/me', (req, res) => {
  // Verificar token del header
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ user: null });
  
  const token = authHeader.split(' ')[1];
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user });
  } catch {
    res.status(401).json({ user: null });
  }
});

router.post('/logout', (req, res) => {
  res.json({ success: true });
});

module.exports = router;
