const dotenv = require('dotenv')
dotenv.config()
const { Pool } = require('pg')

var connectInfo = {}
var pool = null;

if (process.env.HEROKU) {
    pool = new Pool({connectionString:process.env.DATABASE_URL})
} else {
  connectInfo = {
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  }
  pool = new Pool(connectInfo)
}

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
}