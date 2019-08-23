import { log, logError } from '../../lib/log'

export default {
  variables: async (self, args, req) => {
    const { variables } = req.ctx.db.dataLoaders
    const x = await variables('select * from public.variables')
    console.log(x[0]) // This is a single result set
    return []

    // const { queryFromFile } = await req.ctx.db
    // const result = await queryFromFile('queries/protocol.variables.sql', self.id)
    // return result.rows
  }
}
