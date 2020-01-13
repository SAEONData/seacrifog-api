import { log, logError } from '../../lib/log'

export default async (self, args, req) => {
  const { variablesReqSources } = req.ctx.db.dataLoaders
  const result = await variablesReqSources(args.ids)
  return result
}
