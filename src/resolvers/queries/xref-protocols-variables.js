import { log, logError } from '../../lib/log'

export default async (self, args, req) => {
  const { pool } = await req.ctx.db
  const result = await pool.query(`
    select
    x.id,
    x.protocol_id,
    x.variable_id,
    r.name relationship_type
    from public.protocol_variable_xref x
    join public.relationship_types r on r.id = x.relationship_type_id`)
  return result.rows
}
