'use strict'
import { Pool } from 'pg'
import { log, error as logError } from '../lib/log'
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

export default (async () => {
  /**
   * During development, since we are pulling data from an old db
   * the database is dropped and recreated on startup
   * Obviously this will need to be adjusted prior to first use
   * TODO!!!
   */

  // Drop and create seacrifog
  const configDbPool = getPool('postgres')
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

  return seacrifogPool
})().catch(error => logError('Error configuring the database: ', error))
