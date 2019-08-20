import { log, logError } from '../../lib/log'

export default async (self, args, req) => {
  const { db } = await req.ctx
  const result = await db.executeSql('queries/protocols.sql')
  return result.rows
}
