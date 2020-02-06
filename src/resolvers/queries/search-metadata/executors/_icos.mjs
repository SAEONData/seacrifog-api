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
    # extendedDataObjectInfo
    prefix cpmeta: <http://meta.icos-cp.eu/ontologies/cpmeta/>
    prefix prov: <http://www.w3.org/ns/prov#>
    select distinct ?dobj ?station ?stationId ?samplingHeight ?theme ?themeIcon ?title ?description ?columnNames ?site where{
      {
        select ?dobj (min(?station0) as ?station) (sample(?stationId0) as ?stationId) (sample(?samplingHeight0) as ?samplingHeight) (sample(?site0) as ?site) where{
          VALUES ?dobj { <https://meta.icos-cp.eu/objects/Sb2xxbU06-oeCC9ITKxTRdWk> <https://meta.icos-cp.eu/objects/x2gL6BMqkQEbh928i1roE3ky> <https://meta.icos-cp.eu/objects/FrtCNzUnRdup-_hau8K1DZh-> <https://meta.icos-cp.eu/objects/Su3qm3JOhpbGAk8fIJ3gxSRA> <https://meta.icos-cp.eu/objects/rVbJrJG6fv7t53cLMvmId-MV> }
          OPTIONAL{
            ?dobj cpmeta:wasAcquiredBy ?acq.
            ?acq prov:wasAssociatedWith ?stationUri .
            OPTIONAL{ ?stationUri cpmeta:hasName ?station0 }
            OPTIONAL{ ?stationUri cpmeta:hasStationId ?stationId0 }
            OPTIONAL{ ?acq cpmeta:hasSamplingHeight ?samplingHeight0 }
            OPTIONAL{ ?acq cpmeta:wasPerformedAt/cpmeta:hasSpatialCoverage/rdfs:label ?site0 }
          }
        }
        group by ?dobj
      }
      ?dobj cpmeta:hasObjectSpec ?specUri .
      OPTIONAL{ ?specUri cpmeta:hasDataTheme [
        rdfs:label ?theme ;
        cpmeta:hasIcon ?themeIcon
      ]}
      OPTIONAL{ ?dobj <http://purl.org/dc/terms/title> ?title }
      OPTIONAL{ ?dobj <http://purl.org/dc/terms/description> ?description }
      OPTIONAL{?dobj cpmeta:hasActualColumnNames ?columnNames }
    }`
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
