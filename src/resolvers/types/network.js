import { log, logError } from '../../lib/log'

export default {
  variables: async (self, args, req) => {
    const { findVariablesOfNetwork } = req.ctx.db.dataLoaders
    const result = await findVariablesOfNetwork(self.id)
    return result.sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0))
  }
}
