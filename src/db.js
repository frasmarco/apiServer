const { Pool } = require('pg');
const config = require("../config").db;

const db = new Pool(config);

// Catch disconnect events so app doesn't crash
db.on( 'error', function (err) {
    console.error(err.message);
} );

module.exports = db;