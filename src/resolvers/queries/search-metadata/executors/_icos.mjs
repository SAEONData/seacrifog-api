import { parentPort, workerData } from 'worker_threads'
import axios from 'axios'

const themeMap = {
  Terrestrial: 'http://meta.icos-cp.eu/resources/themes/ecosystem',
  Atmospheric: 'http://meta.icos-cp.eu/resources/themes/atmosphere',
  Various: 'http://meta.icos-cp.eu/resources/themes/ecosystem',
  Oceanic: 'http://meta.icos-cp.eu/resources/themes/ocean'
}

/**
 * Logic:
 * (1) Data object spec labels are retrieved for the relevant variables
 * (2) Station URIs are retrieved for selected SEACRIFOG sites
 * (3) Data objects are retrieved for selected stations and sites
 */
;(async search => {
  // Get the theme that is being searched for
  const { variables, sites } = search
  const themeUris = variables.domain.map(v => themeMap[v])

  // Check if search should be done or not
  const doSearch = [variables, sites].reduce((_, curr) => {
    let doSearch = _ || false
    Object.entries(curr).forEach(([key, arr]) => {
      if (arr.length > 0) doSearch = true
    })
    return doSearch
  }, false)

  let metadataRecords
  if (doSearch) {
    // (1) Find the data object specs from ICOS that use this theme
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

    // (2) Get the ICOS UIR IDs of stations being searched for
    const stations = (
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

    select distinct
    ?uri
    ?label
    ?stationId
    
    from <http://meta.icos-cp.eu/ontologies/cpmeta/>
    from <http://meta.icos-cp.eu/resources/cpmeta/>
    from <http://meta.icos-cp.eu/resources/icos/>
    from <http://meta.icos-cp.eu/resources/extrastations/>
    from named <http://meta.icos-cp.eu/resources/wdcgg/>
    
    where {
        { ?uri rdfs:label ?label }
        UNION
        { ?uri cpmeta:hasName ?label }
        UNION 
        {
            graph <http://meta.icos-cp.eu/resources/wdcgg/> {
                ?uri a cpmeta:Station .
                ?uri cpmeta:hasName ?label .
            }
        }
        values ?stationId {${sites.name.map(s => `'${s.replace("'", "''")}'`).join(' ')}}
        ?uri cpmeta:hasStationId ?stationId
    }`
      }).catch(error => console.error('Error searching metadata', error))) || {}
    ).data.results.bindings.map(r => r.uri.value)

    // (3) Get data objects for the themes found above
    metadataRecords = (
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
      ?station
      ?fileName
      ?size
      ?submTime
      ?timeStart
      ?timeEnd

      where {
        ${specs.length > 0 ? `VALUES ?spec { ${specs.map(s => `<${s}>`).join(' ')} }` : ''}
        ?dobj cpmeta:hasObjectSpec ?spec .

        ${stations.length > 0 ? `VALUES ?station { ${stations.map(s => `<${s}>`).join(' ')} }` : ''}
        ?dobj cpmeta:wasAcquiredBy/prov:wasAssociatedWith ?station .

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
  } else {
    metadataRecords = {
      results: {
        bindings: []
      }
    }
  }

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
