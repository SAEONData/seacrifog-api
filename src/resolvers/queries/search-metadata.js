import { log, logError } from '../../lib/log'
import axios from 'axios'

export default async (self, args, req) => {
  const { findNetworks, findVariables, findProtocols } = req.ctx.db.dataLoaders
  const { byNetworks = [], byVariables = [], byProtocols = [] } = args

  // Get networks search terms
  const networks = await Promise.all(byNetworks.map(async id => (await findNetworks(id))[0]))
  const ns = networks.map(n => n.type)

  // Get variables search terms
  const variables = await Promise.all(byVariables.map(async id => (await findVariables(id))[0]))
  const vs = variables.map(v => v.domain)

  // Get protocols search terms
  const protocols = await Promise.all(byProtocols.map(async id => (await findProtocols(id))[0]))
  const ps = protocols.map(p => p.domain)

  const search = [...new Set([...ns, ...vs, ...ps])]

  const { data } = await axios({
    baseURL: 'http://192.168.116.66:9210/search',
    params: {
      index: 'saeon-odp-4-2',
      size: 10000,
      fields: 'metadata_json,record_id,organization',
      'metadata_json.subjects.subject': search.join(',')
    },
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }).catch(error => {
    logError('Error searching metadata', error)
    throw error
  })

  return data.results.map((item, i) => ({ id: i + 1 }))
}
