const pg = require('pg')
const { Pool } = pg

export default new Pool({
  host: 'localhost',
  user: 'postgres',
  database: 'seacrifog',
  password: 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
})
