import { log, logError } from '../../lib/log'

export default {
  protocols: async (self, args, req) => {
    const { queryFromFile } = await req.ctx.db
    const result = await queryFromFile('queries/variable.protocols.sql', self.id)
    return result.rows
  }
}
