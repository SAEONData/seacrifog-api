import { parentPort, workerData } from 'worker_threads'
import axios from 'axios'

const themeMap = {
  Terrestrial: 'http://meta.icos-cp.eu/resources/themes/ecosystem',
  Atmospheric: 'http://meta.icos-cp.eu/resources/themes/atmosphere',
  Various: 'http://meta.icos-cp.eu/resources/themes/ecosystem',
  Oceanic: 'http://meta.icos-cp.eu/resources/themes/ocean'
}

/**
 * Mapping specifcations
 * SEACRIFOG (Variable.domain) | ICOS (Object specification theme)
 * Terrestrial                 | http://meta.icos-cp.eu/resources/themes/ecosystem
 * Atmospheric                 | http://meta.icos-cp.eu/resources/themes/atmosphere
 * Various                     | http://meta.icos-cp.eu/resources/themes/ecosystem
 * Oceanic                     | http://meta.icos-cp.eu/resources/themes/ocean
 */
;(async search => {
  // Get the theme that is being searched for
  const { variables } = search
  const themeUris = variables.domain.map(v => themeMap[v])

  // Find the data object specs from ICOS that use this theme
  const specs = (
    (await axios({
      baseURL: 'https://meta.icos-cp.eu/sparql',
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate, br'
      },
      data: `
    prefix cpmeta: <http://meta.icos-cp.eu/ontologies/cpmeta/>

    select
    ?spec
    ?level
    ?dataset
    ?format
    ?theme
    ?temporalResolution
    
    where {
      values ?level { 2 }
      values ?theme { ${themeUris.map(uri => `<${uri}>`).join(' ')} }
    
      ?spec cpmeta:hasDataLevel ?level .
      FILTER NOT EXISTS { ?spec cpmeta:hasAssociatedProject/cpmeta:hasHideFromSearchPolicy "true"^^xsd:boolean }
      FILTER(STRSTARTS(str(?spec), "http://meta.icos-cp.eu/"))
      ?spec cpmeta:hasDataTheme ?theme .
    
      OPTIONAL {
        ?spec cpmeta:containsDataset ?dataset .
        OPTIONAL{ ?dataset cpmeta:hasTemporalResolution ?temporalResolution }
      }
    
      FILTER EXISTS{
        ?dobj cpmeta:hasObjectSpec ?spec .
        FILTER NOT EXISTS {[] cpmeta:isNextVersionOf ?dobj}
      }
    
      ?spec cpmeta:hasFormat ?format .
    }`
    }).catch(error => console.error('Error searching metadata', error))) || {}
  ).data.results.bindings.map(r => r.spec.value)

  // Get data objects for the themes found above
  const metadataRecords = (
    (await axios({
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
      ?dobj
      ?spec
      ?fileName
      ?size
      ?submTime
      ?timeStart
      ?timeEnd
      where {
        VALUES ?spec { ${specs.map(s => `<${s}>`).join(' ')} }
        ?dobj cpmeta:hasObjectSpec ?spec .  
        ?dobj cpmeta:hasSizeInBytes ?size .
        ?dobj cpmeta:hasName ?fileName .
        ?dobj cpmeta:wasSubmittedBy/prov:endedAtTime ?submTime .
        ?dobj cpmeta:hasStartTime | (cpmeta:wasAcquiredBy / prov:startedAtTime) ?timeStart .
        ?dobj cpmeta:hasEndTime | (cpmeta:wasAcquiredBy / prov:endedAtTime) ?timeEnd .
        FILTER NOT EXISTS {[] cpmeta:isNextVersionOf ?dobj}
      }
      
      order by desc(?submTime)
      offset 0
      limit 100`
    }).catch(error => console.error('Error searching metadata', error))) || {}
  ).data

  if (metadataRecords) {
    parentPort.postMessage({
      success: true,
      result_length: metadataRecords.results.bindings.length,
      results: metadataRecords.results.bindings
    })
  } else {
    parentPort.postMessage({ error: 'ICOS catalogue search failed' })
  }
})(workerData)
  .catch(error => {
    console.log('Unexpected error searching ICOS catalogue', error)
  })
  .finally(() => process.exit(0))
