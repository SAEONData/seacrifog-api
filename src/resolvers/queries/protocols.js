import { log, logError } from '../../lib/log'

export default async (self, args, req) => {
  const { dataLoaders } = await req.ctx
  const result = await dataLoaders.executeSql('queries/protocols.sql')
  return result.rows
}
