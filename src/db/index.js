'use strict'
import { Pool } from 'pg'
import { log, logError } from '../lib/log'
import { readFileSync } from 'fs'
import { config } from 'dotenv'
import { join, normalize } from 'path'
import DataLoader from 'dataloader'
import sift from 'sift'
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
  let sql = readFileSync(normalize(join(__dirname, `./sql/${filepath}`))).toString('utf8')
  args.forEach((arg, i) => {
    const regex = new RegExp(`:${i + 1}`, 'g')
    sql = sql.replace(regex, `${arg}`)
  })
  return sql
}

export const pool = getPool(DB)

export const execSqlFile = async (filepath, ...args) => {
  const sql = loadSqlFile(filepath, ...args)
  return await pool.query(sql)
}

/**
 * For development purposes
 * While the model is still being built it's helpful to refresh the database
 * on every Node.js restart. This should obviously be deleted at some point
 */
Promise.resolve(
  (async () => {
    log(
      '\n\n',
      '============================================ WARNING!!!!! ==================================================\n',
      "Dropping and recreating databases. If you see this as a log on the production server YOU'RE IN TROUBLE!!!!!!\n",
      '============================================================================================================\n\n'
    )
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
  })()
).catch(err => {
  logError('Error initializing DEV database', err)
  process.exit(1)
})

/**
 * TODO
 * I think these will work as intended. But the example is certainly better!
 * https://github.com/graphql/dataloader/blob/master/examples/SQL.md
 */
export const initializeLoaders = () => {
  const variablesOfProtocolsLoader = new DataLoader(async keys => {
    const sql = `
    select
    v.*,
    x.protocol_id
    from public.protocol_variable_xref x
    join public.variables v on v.id = x.variable_id
    where x.protocol_id in (${keys.join(',')})`
    const rows = (await pool.query(sql)).rows
    return keys.map(key => rows.filter(sift({ protcol_id: key })) || [])
  })

  const protocolsOfVariablesLoader = new DataLoader(async keys => {
    const sql = `
    select
    p.*,
    x.variable_id
    from public.protocol_variable_xref x
    join public.protocols p on p.id = x.protocol_id
    where x.variable_id in (${keys.join(',')})`
    const rows = (await pool.query(sql)).rows
    return keys.map(key => rows.filter(sift({ variable_id: key })) || [])
  })

  return {
    findVariablesOfProtocols: key => variablesOfProtocolsLoader.load(key),
    findProtocolsOfVariables: key => protocolsOfVariablesLoader.load(key)
  }
}
