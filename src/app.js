// app.js
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import indexRouter from './routes/index'
import { buildSchema } from 'graphql'
import graphqlHTTP from 'express-graphql'

const app = express()

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001']
var allowCrossDomain = function(req, res, next) {
  const origin = req.headers.origin
  if (allowedOrigins.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin)
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Credentials', true)
  next()
}

app.use(logger('dev'))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// Serve static files
app.use(express.static(path.join(__dirname, '../public')))

// Serve the router
app.use(allowCrossDomain)
app.use('/', indexRouter)

// Server GraphQL endpoint

var schema = buildSchema(`
  type Query {
    hello: String
  }
`)

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  }),
)

export default app