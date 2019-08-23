'use strict'
import { Pool } from 'pg'
import { log, logError } from '../lib/log'
import { readFileSync } from 'fs'
import { config } from 'dotenv'
import { join, normalize } from 'path'
import DataLoader from 'dataloader'
config()

const DB = process.env.POSTGRES_DATABASE || 'seacrifog'

const getPool = database =>
  new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    user: process.env.POSTGRES_USER || 'postgres',
    database,
    password: process.env.POSTGRES_PASSWORD || 'password',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  })

const loadSqlFile = (filepath, ...args) => {
  let sql = readFileSync(normalize(join(__dirname, `../sql/${filepath}`))).toString('utf8')
  args.forEach((arg, i) => {
    const regex = new RegExp(`:${i + 1}`, 'g')
    sql = sql.replace(regex, `${arg}`)
  })
  return sql
}

/**
 * During development, since we are pulling data from an old db
 * the database is dropped and recreated on startup
 * Obviously this will need to be adjusted prior to first use
 * TODO!!!
 */

const initializeDbTemp = async () => {
  // Drop and create seacrifog
  const configDbPool = getPool('postgres')
  await configDbPool.query(loadSqlFile('migration/db-setup/stop-db.sql', DB))
  await configDbPool.query(loadSqlFile('migration/db-setup/drop-db.sql', DB))
  await configDbPool.query(loadSqlFile('migration/db-setup/create-db.sql', DB))
  await configDbPool.end()
  log('seacrifog database dropped and re-created!')

  // Create the seacrifog schema, and populate database
  const seacrifogPool = getPool(DB)
  await seacrifogPool.query(loadSqlFile('migration/schema.sql'))
  await seacrifogPool.query(loadSqlFile('migration/etl.sql'))
  log('seacrifog schema re-created!')
  await seacrifogPool.end()
}

/**
 * This function is invoked once per app start
 */
export const initializeDbPool = async () => {
  await initializeDbTemp()
  return getPool(DB)
}

/**
 * This function is initialized once per request-response lifecycle
 * @param {Object} pool An instance of pg's Pool constructor
 */
export const initializeFileQuery = pool => async (filepath, ...args) => {
  const sql = loadSqlFile(filepath, ...args)
  return await pool.query(sql)
}

/**
 * This function is initialized once per request-response lifecycle
 * @param {Object} pool An instance of pg's Pool constructor
 */
export const initializeLoaders = pool => {
  // Create the finders object
  const finders = {}

  finders.variables = (() => {
    const loader = new DataLoader(async queries => {
      const results = []
      for (const query of queries) {
        const result = await pool.query(query)
        const rows = result.rows
        results.push(rows)
      }
      return new Promise(res => res(results))
    })
    return (loader => query => loader.load(query))(loader)
  })()

  return finders
}
