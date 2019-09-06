import { log, logError } from '../../lib/log'

export default {
  directly_related_protocols: async (self, args, req) => {
    const { findProtocolsOfVariables } = await req.ctx.db.dataLoaders
    const result = await findProtocolsOfVariables(self.id)
    return result
      .filter(r => r.relationship_type_name === 'direct')
      .sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0))
  },
  indirectly_related_protocols: async (self, args, req) => {
    const { findProtocolsOfVariables } = await req.ctx.db.dataLoaders
    const result = await findProtocolsOfVariables(self.id)
    return result
      .filter(r => r.relationship_type_name === 'indirect')
      .sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0))
  },
  dataProducts: async (self, args, req) => {
    const { findDataProductsOfVariables } = await req.ctx.db.dataLoaders
    const result = await findDataProductsOfVariables(self.id)
    return result.sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0))
  }
}
