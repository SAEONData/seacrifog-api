import { log, logError } from '../../lib/log'
import ctx from 'express-http-context'

export default async () => {
  const db = ctx.get('db')
  const result = await db.query(`select * from protocols`)
  return result.rows
}
