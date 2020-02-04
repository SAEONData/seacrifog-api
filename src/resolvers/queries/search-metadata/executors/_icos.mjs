import { parentPort, workerData } from 'worker_threads'
import axios from 'axios'
;(async search => {
  const options = {
    baseURL: 'https://meta.icos-cp.eu/sparql',
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      Accept: 'application/json',
      'accept-encoding': 'gzip, deflate, br'
    },
    data: `
    prefix cpmeta: <http://meta.icos-cp.eu/ontologies/cpmeta/>
    prefix prov: <http://www.w3.org/ns/prov#>
    
    select
    (str(?submTime) as ?time)
    ?dobj
    ?spec
    ?dataLevel
    ?fileName
    
    where {
      ?dobj cpmeta:hasName ?fileName .
      ?dobj cpmeta:hasObjectSpec [rdfs:label ?spec ; cpmeta:hasDataLevel ?dataLevel].
    }
    order by desc(?submTime)
    limit 1000`
  }

  console.log('ICOS Metadata search', options)

  const data = (
    (await axios(options).catch(error => console.error('Error searching metadata', error))) || {}
  ).data

  if (data) {
    parentPort.postMessage({
      success: true,
      result_length: data.results.bindings.length,
      results: data
    })
  } else {
    parentPort.postMessage({ error: 'ICOS catalogue search failed' })
  }
})(workerData)
  .catch(error => {
    console.log('Unexpected error searching ICOS catalogue', error)
  })
  .finally(() => process.exit(0))
