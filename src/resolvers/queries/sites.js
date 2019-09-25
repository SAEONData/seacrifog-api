import { log, logError } from '../../lib/log'

export default async (self, args, req) => {
  const { pool } = await req.ctx.db
  const result = await pool.query(`
    select
    id,
    "name",
    ST_AsGeoJSON(st_transform(lng_lat, 3857)) lng_lat
    from public.sites;`)
  return result.rows
}
