import { log, logError } from '../../lib/log'

export default async (self, args, req) => {
  const { pool } = await req.ctx.db
  const result = await pool.query(`
    select
    id,
    "name",
    ST_AsGeoJSON(st_transform(xyz, 4326)) xyz
    from public.sites;`)
  return result.rows
}
