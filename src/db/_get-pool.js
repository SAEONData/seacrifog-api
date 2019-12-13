export default ({ DB, POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT }) =>
  new Pool({
    host: POSTGRES_HOST,
    user: POSTGRES_USER,
    database: DB,
    password: POSTGRES_PASSWORD,
    port: POSTGRES_PORT,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  })
