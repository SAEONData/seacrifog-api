'use strict'
import express from 'express'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import compression from 'compression'
import router from './routes'
import { makeExecutableSchema } from 'graphql-tools'
import graphqlHTTP from 'express-graphql'
import { readFileSync } from 'fs'
import { normalize, join } from 'path'
import resolvers from './resolvers'
import { log, logError } from './lib/log'
import { pool, execSqlFile, initializeLoaders, findVariables } from './db'
import { config } from 'dotenv'
import nativeExtensions from './lib/native-extensions'

// Configure the app
config()
nativeExtensions()

// Helper for allowing async / await with middleware
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

// Env config
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001']
log('allowed origins', ALLOWED_ORIGINS)

const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin
  const httpVerb = req.method
  log(`Checking CORS policy`, `${origin}`, `${ALLOWED_ORIGINS.includes(origin)}`)
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Credentials', true)
  if (httpVerb === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
}

const compressionFilter = (req, res) =>
  req.headers['x-no-compression'] ? false : compression.filter(req, res)

const app = express()
app.use(compression({ filter: compressionFilter }))
app.use(morgan('short'))
app.use(corsMiddleware)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(join(__dirname, '../public')))

/**
 * Provides a request lifecycle object to append adhoc things
 *  => req.ctx
 */
app.use(
  asyncHandler(async (req, res, next) => {
    req.ctx = {
      db: {
        pool,
        dataLoaders: initializeLoaders()
      }
    }
    next()
  })
)

// Setup HTTP router
app.use('/', asyncHandler(router))

// Load GraphQL schema
const typeDefsPath = normalize(join(__dirname, './schema.graphql'))
const typeDefs = readFileSync(typeDefsPath, { encoding: 'utf8' })
const schema = makeExecutableSchema({ typeDefs, resolvers })

// Make GraphiQL available
app.use(
  '/graphiql',
  graphqlHTTP({
    schema,
    graphiql: true
  })
)

// GraphQL endpoint
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: false
  })
)

export default app
