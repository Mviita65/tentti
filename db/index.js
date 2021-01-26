const { Pool } = require('pg')

var connectInfo = {}
var pool = null;

if (process.env.HEROKU) {
    pool = new Pool({connectionString:process.env.DATABASE_URL})
} else {
  connectInfo = {
    user: 'postgres',
    host: 'localhost',
    database: 'Tenttikanta',
    password: 'MAVLtd',
    port: 5432
  }
  pool = new Pool(connectInfo)
}


module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
}