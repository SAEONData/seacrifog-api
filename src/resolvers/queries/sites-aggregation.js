import { log, logError } from '../../lib/log'

export default async (self, args, req) => {
  const { aggregationSites } = req.ctx.db.dataLoaders
  const result = await aggregationSites(args.ids)
  console.log('result:')
  console.log(result)
  return result //**check what is result[0]
}
