import { parentPort, workerData } from 'worker_threads'
import axios from 'axios'
;(async search => {
  const options = {
    baseURL: 'https://meta.icos-cp.eu/sparql',
    method: 'GET',
    params: {
      query: `prefix cpmeta: <http://meta.icos-cp.eu/ontologies/cpmeta/>
      prefix dcterms: <http://purl.org/dc/terms/>
      select * where{
        ?coll a cpmeta:Collection .
        OPTIONAL{?coll cpmeta:hasDoi ?doi}
        ?coll dcterms:title ?title .
        FILTER NOT EXISTS {[] cpmeta:isNextVersionOf ?coll}
      }
      order by ?title`
    }
  }

  const { data } = await axios(options).catch(error => {
    console.error('Error searching metadata', error)
    throw error
  })

  parentPort.postMessage({
    success: true,
    result_length: 0,
    results: data
  })
})(workerData)
  .catch(error => {
    console.log('Unexpected error searching ICOS catalogue', error)
  })
  .finally(() => process.exit(0))
