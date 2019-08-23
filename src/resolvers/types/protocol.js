import { log, logError } from '../../lib/log'

export default {
  variables: async (self, args, req) => {
    const { variables } = req.ctx.db.dataLoaders
    console.log('hello there!', variables)
    return []

    // const { queryFromFile } = await req.ctx.db
    // const result = await queryFromFile('queries/protocol.variables.sql', self.id)
    // return result.rows
  }
}
