import { log, logError } from '../../lib/log'

export default async (self, args, req) => {
  const { aggregationSites } = req.ctx.db.dataLoaders
  const result = await aggregationSites(args.ids)
  return result
  //result is: [ { site_id: 1, network_count: '2' } ]
  //figure out what exactly this is doing and what is the appropriate return
}
