import { log, logError } from '../../lib/log'

export default async (self, args, req) => {
  const { xrefProtocolsVariables } = await req.ctx.db.dataLoaders
  return await xrefProtocolsVariables()
}
