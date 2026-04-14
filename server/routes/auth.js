const router = require('express').Router();
const passport = require('../config/passport');
//ruta para iniciar el proceso de autenticacion con google
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

//ruta de callback que google redirige despues de la autenticacion
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
  }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ user: null });
  const { id, name, email, avatar } = req.user;
  res.json({ user: { id, name, email, avatar } });
});

router.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ success: true });
  });
});

module.exports = router;