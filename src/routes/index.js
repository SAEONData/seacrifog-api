import express from 'express'
var router = express.Router()

router.get('/', async (req, res, next) => {
  res.redirect('/graphiql')
})

router.get('/http', async (req, res, next) => {
  res.send('This is the HTTP API for SEACRIFOG')
})

router.get('/http/variables', async (req, res, next) => {
  res.send('hi')
})

export default router
