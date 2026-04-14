const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const {pool}= require('./database');

//passport es un middleware de autenticacion para node.js que permite autenticar si los usuarios existen en la base de datos
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const [rows] = await pool.query(
          // checa si el usuario ya existe en la base de datos
          'SELECT * FROM users WHERE google_id = ?',
          [profile.id]
        );

        if (rows.length > 0) {
          await pool.query(

            'UPDATE users SET access_token = ?, refresh_token = ? WHERE google_id = ?',
            [accessToken, refreshToken, profile.id]
          );
          return done(null, rows[0]);
        }


        //si el usuario no existe, lo crea en la base de datos
        const [result] = await pool.query(
          `INSERT INTO users (google_id, name, email, avatar, access_token, refresh_token)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            profile.id,
            profile.displayName,
            profile.emails[0].value,
            profile.photos[0]?.value,
            accessToken,
            refreshToken,
          ]
        );

        const [newUser] = await pool.query(
          'SELECT * FROM users WHERE id = ?',
          [result.insertId]
        );

        return done(null, newUser[0]);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

//serializa el usuario para guardarlo en la session
passport.serializeUser((user, done) => {
    done(null, user.id)
});

//des
passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;