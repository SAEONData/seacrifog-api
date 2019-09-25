import { log, logError } from '../../lib/log'

export default {
  networks: async (self, args, req) => {
    const { findNetworksOfSites } = req.ctx.db.dataLoaders
    const result = await findNetworksOfSites(self.id)
    return result.sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0))
  }
}
