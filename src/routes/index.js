import express from 'express'
var router = express.Router()

router.get('/', async (req, res, next) => {
  res.redirect('/graphiql')
})

router.get('/http', async (req, res, next) => {
  res.send('This is the HTTP API for SEACRIFOG')
})

router.get('/http/variables/:id*?', async (req, res, next) => {
  const id = req.params.id
  const { allVariables, findVariables } = await req.ctx.db.dataLoaders
  if (id) {
    const result = await findVariables(parseInt(id, 10))
    res.send(result[0] || null)
  } else {
    const result = await allVariables()
    res.send(result)
  }
})

export default router
