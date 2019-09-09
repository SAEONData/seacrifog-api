import { log, logError } from '../../lib/log'

export default async (self, args, req) => {
  const { findDataProducts } = req.ctx.db.dataLoaders
  const result = await findDataProducts(args.id)
  return result[0]
}
