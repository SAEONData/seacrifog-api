const { parentPort, workerData } = require('worker_threads')
const axios = require('axios')

;(async search => {
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
    console.error('Error searching metadata', error)
    throw error
  })

  parentPort.postMessage(data)
})(workerData).catch(error => {
  console.log('Error executing finder', error)
  throw error
})
