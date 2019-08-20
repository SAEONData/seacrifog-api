import { log, logError } from '../../lib/log'

export default async (self, args, req) => {
  const { pgPool } = req.ctx
  const result = await pgPool.query(`select id, name, class, domain from variables`)
  return result.rows
}
