import express from 'express'
var router = express.Router()

router.get('/', async (req, res, next) => {
  res.redirect('/graphiql')
})

router.get('/http', async (req, res, next) => {
  res.send('This is the HTTP API for SEACRIFOG')
})

router.get('/http/variables', async (req, res, next) => {
  const { allVariables } = await req.ctx.db.dataLoaders
  const result = await allVariables()
  res.send(result)
})

router.get('/http/variables/:id*?', async (req, res, next) => {
  const id = req.params.id
  const { findVariables } = await req.ctx.db.dataLoaders
  const result = await findVariables(parseInt(id, 10))
  res.send(result[0] || null)
})

/**
 * The client specifies the name of the report
 * The client also provides a list of IDs
 */
router.get('/downloads/:report', async (req, res, next) => {
  const { findVariables, findProtocols, findNetworks, findSites, findDataproducts } = await req.ctx
    .db.dataLoaders
  const report = req.params.report

  const map = {
    PROTOCOLS: findProtocols,
    VARIABLES: findVariables,
    NETWORKS: findNetworks,
    SITES: findSites,
    DATAPRODUCTS: findDataproducts
  }

  const queryParams = req.query
  let { filename, ids } = queryParams
  ids = ids.split(',').map(id => parseInt(id, 10))

  const result = await Promise.all(ids.map(async id => (await Promise.resolve(map[report](id)))[0]))

  res.set({ 'Content-Disposition': `attachment; filename=\"${filename}\"` })
  res.status(200).send(JSON.stringify(result))
})

export default router
