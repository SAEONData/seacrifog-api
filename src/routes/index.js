// routes/index.js
import express from 'express'
var router = express.Router()

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('hi')
})
export default router