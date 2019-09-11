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
  dataproducts: async (self, args, req) => {
    const { findDataproductsOfVariables } = await req.ctx.db.dataLoaders
    const result = await findDataproductsOfVariables(self.id)
    return result.sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0))
  },
  rforcings: async (self, args, req) => {
    const { findRForcingsOfVariables } = await req.ctx.db.dataLoaders
    const result = await findRForcingsOfVariables(self.id)
    return result.sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0))
  }
}
