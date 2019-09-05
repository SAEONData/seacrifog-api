import { log, logError } from '../../lib/log'

export default {
  directly_related_variables: async (self, args, req) => {
    const { findVariablesOfProtocols } = req.ctx.db.dataLoaders
    const result = await findVariablesOfProtocols(self.id)
    return result
      .filter(r => r.relationship_type_name === 'direct')
      .sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0))
  },
  indirectly_related_variables: async (self, args, req) => {
    const { findVariablesOfProtocols } = req.ctx.db.dataLoaders
    const result = await findVariablesOfProtocols(self.id)
    return result
      .filter(r => r.relationship_type_name === 'indirect')
      .sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0))
  }
}
