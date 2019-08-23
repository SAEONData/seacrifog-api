import { log, logError } from '../../lib/log'

export default async (self, args, req) => {
  const { queryFromFile } = await req.ctx.db
  const result = await queryFromFile('queries/protocols.sql')
  return result.rows
}
