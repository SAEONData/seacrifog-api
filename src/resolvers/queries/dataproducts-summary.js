import { log, logError } from '../../lib/log'

export default async (self, args, req) => {
  const { pool } = req.ctx.db
  const result = (await pool.query('select count(*) count from public.dataproducts;')).rows
  return result[0]
}
