import express from 'express'
var router = express.Router()

router.get('/', async (req, res, next) => {
  res.send('hi')
})

export default router
