import { log, logError } from '../../lib/log'

export default {
  protocols: async (self, args, req) => {
    const { db } = await req.ctx
    const result = await db.executeSql('queries/variable.protocols.sql', self.id)
    return result.rows
  }
}
