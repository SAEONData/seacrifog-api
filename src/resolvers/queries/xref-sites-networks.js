import { log, logError } from '../../lib/log'

export default async (self, args, req) => {
  const { xrefSitesNetworks } = await req.ctx.db.dataLoaders
  return await xrefSitesNetworks()
}
