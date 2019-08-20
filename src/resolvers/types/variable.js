import { log, logError } from '../../lib/log'

export default {
  protocols: async (self, args, req) => {
    const { pgPool } = req.ctx
    const result = await pgPool.query(
      `select
       p.id,
       p.doi,
       p.author,
       p.publisher,
       p.title
       from
       public.protocols p
       join public.protocol_variable_xref x on x.protocol_id = p.id
       join public.variables v on v.id = x.variable_id
       where v.id = ${self.id}`
    )
    return result.rows
  }
}
