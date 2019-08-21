import { log, logError } from '../../lib/log'

export default {
  variables: async (self, args, req) => {
    const { db } = await req.ctx
    const result = await db.executeSql('queries/protocol.variables.sql', self.id)
    return result.rows
  }
}
