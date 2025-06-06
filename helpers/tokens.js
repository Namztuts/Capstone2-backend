const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

/** return signed JWT from user data. */
function createToken(user) {
   console.assert(
      user.isAdmin !== undefined,
      'createToken passed user without isAdmin property'
   ); //warning if missing user.isAdmin | does NOT throw an error, just logs to the console

   let payload = {
      username: user.username,
      isAdmin: user.isAdmin || false,
   };

   return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
