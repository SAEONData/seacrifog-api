import { log, logError } from '../../lib/log'

export default {
  protocols: async (self, args, req) => {
    const { dataLoaders } = await req.ctx
    const result = await dataLoaders.executeSql('queries/variable.protocols.sql', self.id)
    return result.rows
  }
}
