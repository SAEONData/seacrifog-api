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
  try {
    let seacrifogPool
    const configDbPool = getPool('postgres')
    const dbExists = (await configDbPool.query(
      `select exists(select datname from pg_catalog.pg_database where datname = 'seacrifog');`
    )).rows[0].exists
    if (!dbExists) {
      await configDbPool.query('create database seacrifog;')
      await configDbPool.end()
      log('seacrifog database created!')
      seacrifogPool = getPool(process.env.POSTGRES_DATABASE || 'seacrifog')
      const schema = readFileSync(normalize(join(__dirname, './schema.sql')), { encoding: 'utf8' })
      await seacrifogPool.query(schema)
      log('seacrifog schema created!')
    } else {
      log('Started app WITHOUT creating database and seeding schema (db already exists)')
    }

    return seacrifogPool || getPool(process.env.POSTGRES_DATABASE || 'seacrifog')
  } catch (error) {
    logError('Error configuring the database: ', error)
  }
})()
