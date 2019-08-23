import { log, logError } from '../../lib/log'

export default async (self, args, req) => {
  const { dataLoaders } = await req.ctx
  const result = await dataLoaders.executeSql('queries/variables.sql')
  return result.rows
}
