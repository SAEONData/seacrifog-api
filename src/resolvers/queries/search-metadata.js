import { log, logError } from '../../lib/log'
import axios from 'axios'

export default async (self, args, req) => {
  const { byVariables = [], byProtocols = [], bySites = [], byNetworks = [] } = args
  const response = await axios({
    baseURL: 'http://192.168.116.66:9210/search',
    params: {
      index: 'saeon-odp-4-2',
      size: 100,
      fields: 'metadata_json,record_id,organization',
      'metadata_json.subjects.subject': 'fire,wind'
    },
    method: 'GET'
  })

  const { data } = response

  console.log(data)
  return []
}
