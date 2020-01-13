import { log, logError } from '../../lib/log'

export default async (self, args, req) => {
  const { variablesSets } = req.ctx.db.dataLoaders
  const result = await variablesSets(args.ids)
  return result
}
