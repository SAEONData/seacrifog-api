import { log, logError } from '../../lib/log'

export default {
  protocols: async (self, args, req) => {
    const { findProtocolsOfVariables } = await req.ctx.db.dataLoaders
    const result = await findProtocolsOfVariables(self.id)
    return result.sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0))
  }
}
