import { Pool } from 'pg'

export default ({ host, user, database, password, port }) =>
  new Pool({
    host,
    user,
    database,
    password,
    port,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  })
