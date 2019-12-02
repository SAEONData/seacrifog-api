import { log, logError } from '../../lib/log'

export default async (self, args, req) => {
  const { allDataproducts } = req.ctx.db.dataLoaders
  const { variables = [], protocols = [] } = args
  return await allDataproducts()
}
