const { Pool } = require('pg')

var connectInfo = {}

if (process.env.HEROKU) {
  connectInfo = {
    user: 'postgres',
    host: 'localhost',
    database: 'Tenttikanta',
    password: 'MAVLtd',
    port: 5432
  }
} else {
  connectInfo = {
    user: 'postgres',
    host: 'localhost',
    database: 'Tenttikanta',
    password: 'MAVLtd',
    port: 5432
  }
}

const pool = new Pool(connectInfo)

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
}