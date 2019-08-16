import Pool from '../lib/pg'
import { log } from '../lib/log'
import { readFileSync } from 'fs'
import { config } from 'dotenv'
import { join, normalize } from 'path'
config()

export default (async () => {
  // Setup the database if it doesn't exist
  const configDbPool = Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    user: process.env.POSTGRES_USER || 'postgres',
    database: 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432
  })

  const dbExists = (await configDbPool.query(
    `select exists(select datname from pg_catalog.pg_database where datname = 'seacrifog');`
  )).rows[0].exists

  if (!dbExists) {
    log('Creating seacrifog database')
    await configDbPool.query('create database seacrifog;')
    await configDbPool.end()

    const configSchemaPool = Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      user: process.env.POSTGRES_USER || 'postgres',
      database: process.env.POSTGRES_DATABASE || 'seacrifog',
      password: process.env.POSTGRES_PASSWORD || 'password',
      port: parseInt(process.env.POSTGRES_PORT, 10) || 5432
    })
    log('Creating seacrifog schema')
    const schema = readFileSync(normalize(join(__dirname, './schema.sql')), { encoding: 'utf8' })
    await configSchemaPool.query(schema)
    await configSchemaPool.end()
  }

  return Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    user: process.env.POSTGRES_USER || 'postgres',
    database: process.env.POSTGRES_DATABASE || 'seacrifog',
    password: process.env.POSTGRES_PASSWORD || 'password',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432
  })
})()
