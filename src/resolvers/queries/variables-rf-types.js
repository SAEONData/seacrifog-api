import { log, logError } from '../../lib/log'

export default async (self, args, req) => {
  const { variablesRfTypes } = req.ctx.db.dataLoaders
  const result = await variablesRfTypes(args.ids)
  return result
}
