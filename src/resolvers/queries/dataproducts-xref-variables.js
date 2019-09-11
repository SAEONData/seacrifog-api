import { log, logError } from '../../lib/log'

export default async (self, args, req) => {
  const { pool } = await req.ctx.db
  const result = await pool.query('select * from public.dataproduct_variable_xref;')
  return result.rows
}
