import { log, error } from '../../lib/log'
import ctx from 'express-http-context'

export default async () => {
  const db = ctx.get('db')
  const result = await db.query(`select id, name, class, domain from variables`)
  return result.rows
}
