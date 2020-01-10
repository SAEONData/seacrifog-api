import { log, logError } from '../../lib/log'

export default async (self, args, req) => {
  const { networksTypes } = req.ctx.db.dataLoaders
  const result = await networksTypes(args.ids)
  return result
  //result is: [ { site_id: 1, network_count: '2' } ]
}
