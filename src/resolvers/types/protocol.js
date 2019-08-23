import { log, logError } from '../../lib/log'

export default {
  variables: async (self, args, req) => {
    const { dataLoaders } = await req.ctx
    const result = await dataLoaders.executeSql('queries/protocol.variables.sql', self.id)
    return result.rows
  }
}
