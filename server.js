'use strict';

const app = require('./app');
const { PORT } = require('./config');

//NOTE: testing what the error may be when deploying backend on Render
console.log('PORT:', PORT);
console.log('DB:', process.env.DATABASE_URL);

app.listen(PORT, function () {
   console.log(`Started on http://localhost:${PORT}`);
});
