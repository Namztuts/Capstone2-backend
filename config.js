'use strict';

//Shared config for app
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY || 'secret-dev';
const PORT = +process.env.PORT || 3001;

//Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
   return process.env.NODE_ENV === 'test'
      ? 'postgresql://namztuts:password@localhost/a_and_e_test'
      : process.env.DATABASE_URL ||
           'postgresql://namztuts:password@localhost/a_and_e';
}

//Speed up bcrypt during tests, since the algorithm safety isn't being tested
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === 'test' ? 1 : 12;

if (process.env.NODE_ENV !== 'test') {
   console.log('App Config:');
   console.log('SECRET_KEY:', SECRET_KEY);
   console.log('PORT:', PORT);
   console.log('BCRYPT_WORK_FACTOR:', BCRYPT_WORK_FACTOR);
   console.log('Database:', getDatabaseUri());
   console.log('---');
}

module.exports = {
   SECRET_KEY,
   PORT,
   BCRYPT_WORK_FACTOR,
   getDatabaseUri,
};
