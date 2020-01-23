import { parentPort, workerData } from 'worker_threads'
import axios from 'axios'

const getSubjects = search => {
  const { acronym, type } = search.networks
  const { name, class: variableClass, domain: variableDomain, technology_type } = search.variables
  const { category, domain: protocolDomain } = search.protocols
  return encodeURIComponent(
    [
      ...acronym,
      ...type,
      ...name,
      ...variableClass,
      ...variableDomain,
      ...technology_type,
      ...category,
      ...protocolDomain
    ].join(',')
  )
}

const getTitles = search => {
  const { title: networkTitle } = search.networks
  const { name: variableTitle } = search.variables
  const { title: protocolTitle } = search.protocols
  return encodeURIComponent([...networkTitle, ...variableTitle, ...protocolTitle].join(','))
}

const getIdentifiers = ({ protocols }) => encodeURIComponent(protocols.doi.join(','))

;(async search => {
  /**
   * Prepare the search
   */

  const options = {
    baseURL: 'http://192.168.116.66:9210/search',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    params: {
      index: 'saeon-odp-4-2',
      size: 10000,
      fields: 'metadata_json,record_id,organization'
    }
  }

  const subjects = getSubjects(search)
  if (subjects) options.params['metadata_json.subjects.subject'] = subjects

  const titles = getTitles(search)
  if (titles) options.params['metadata_json.titles.title'] = titles

  const identifiers = getIdentifiers(search)
  if (identifiers)
    options.params['metadata_json.alternateIdentifiers.alternateIdentifier'] = identifiers

  /**
   * Log the search
   */
  console.log('SAEON Metadata search', options)

  /**
   * Do the search
   */
  const { data } = await axios(options).catch(error => {
    console.error('Error searching metadata', error)
    throw error
  })

  // Throw error if search is not succcessful
  if (!data.success) throw data

  /**
   * Return the search
   */
  parentPort.postMessage(data)
})(workerData).catch(error => {
  console.error('Error executing finder', JSON.stringify(error))
  process.exit(1)
})
