import express from 'express'
var router = express.Router()

router.get('/', async (req, res, next) => {
  res.redirect('/graphiql')
})

export default router
