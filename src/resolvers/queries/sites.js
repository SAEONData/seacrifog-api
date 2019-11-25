import { log, logError } from '../../lib/log'

export default async (self, args, req) => {
  const { pool } = await req.ctx.db
  const { findSites } = req.ctx.db.dataLoaders
  const { ids } = args

  if (ids) {
    return await Promise.all(ids.map(async id => (await Promise.resolve(findSites(id)))[0]))
  } else {
    return (await pool.query(`
      select
      id,
      "name",
      ST_AsGeoJSON(st_transform(xyz, 4326)) xyz
      from public.sites;`)).rows
  }
}
