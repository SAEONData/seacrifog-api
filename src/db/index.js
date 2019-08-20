'use strict'
import { Pool } from 'pg'
import { log, logError } from '../lib/log'
import { readFileSync } from 'fs'
import { config } from 'dotenv'
import { join, normalize } from 'path'
config()

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

/**
 * During development, since we are pulling data from an old db
 * the database is dropped and recreated on startup
 * Obviously this will need to be adjusted prior to first use
 * TODO!!!
 */
export const initializeDbTemp = async () => {
  // Drop and create seacrifog
  const configDbPool = getPool('postgres')
  await configDbPool.query(`
    SELECT pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE pg_stat_activity.datname = '${process.env.POSTGRES_DATABASE || 'seacrifog'}'
    AND pid <> pg_backend_pid();`)

  await configDbPool.query(
    `drop database if exists ${process.env.POSTGRES_DATABASE || 'seacrifog'};`
  )
  await configDbPool.query(`create database ${process.env.POSTGRES_DATABASE || 'seacrifog'};`)
  await configDbPool.end()
  log('seacrifog database dropped and re-created!')

  // Create the seacrifog schema, and populate database
  const seacrifogPool = getPool(process.env.POSTGRES_DATABASE || 'seacrifog')
  const schema = readFileSync(normalize(join(__dirname, '../sql/migration/schema.sql')), {
    encoding: 'utf8'
  })
  await seacrifogPool.query(schema)
  await seacrifogPool.query('create extension dblink;')
  const etl = readFileSync(normalize(join(__dirname, '../sql/migration/etl.sql')), {
    encoding: 'utf8'
  })
  await seacrifogPool.query(etl)
  log('seacrifog schema re-created!')
  await seacrifogPool.end()
}

export const initializeDb = async () => {
  const pool = getPool(process.env.POSTGRES_DATABASE || 'seacrifog')
  return {
    pool,
    executeSql: async (filepath, ...args) => {
      // Load the SQL query
      let sql = readFileSync(normalize(join(__dirname, `../sql/${filepath}`)), {
        encoding: 'utf8'
      })
      // Load the args into the query
      args.forEach((arg, i) => {
        sql = sql.replace(`:${i + 1}`, `${arg}`)
      })
      // Execute the SQL
      return await pool.query(sql)
    }
  }
}
