import { Worker } from 'worker_threads'
import { readdirSync } from 'fs'

/**
 * A list of executors to search metadata endpoints
 */
const executors = readdirSync(__dirname + '/executors').filter(
  filename => filename.indexOf('_example') !== 0
)

/**
 * Target name  maps
 */
const targets = {
  _saeon: 'SAEON CKAN: saeon-odp-4-2',
  _icos: 'ICOS Metadata Results'
}

export default async (self, args, req) => {
  const { findNetworks, findVariables, findProtocols } = req.ctx.db.dataLoaders
  const { byNetworks = [], byVariables = [], byProtocols = [] } = args
  const search = {}

  // Resolve IDs to networks, variables and protocols
  const networks = await Promise.all(byNetworks.map(async id => (await findNetworks(id))[0]))
  const variables = await Promise.all(byVariables.map(async id => (await findVariables(id))[0]))
  const protocols = await Promise.all(byProtocols.map(async id => (await findProtocols(id))[0]))

  // Networks search object
  search.networks = networks.reduce(
    (acc, n) => ({
      title: [...new Set([...acc.title, n.title])],
      acronym: [...new Set([...acc.acronym, n.acronym])],
      start_year: [...new Set([...acc.start_year, n.start_year])],
      end_year: [...new Set([...acc.end_year, n.end_year])],
      type: [...new Set([...acc.type, n.type])]
    }),
    {
      title: [],
      acronym: [],
      start_year: [],
      end_year: [],
      type: []
    }
  )

  // Variables search object
  search.variables = variables.reduce(
    (acc, v) => ({
      name: [...new Set([...acc.name, v.name])],
      class: [...new Set([...acc.class, v.class])],
      domain: [...new Set([...acc.domain, v.domain])],
      technology_type: [...new Set([...acc.technology_type, v.technology_type])]
    }),
    {
      name: [],
      class: [],
      domain: [],
      technology_type: []
    }
  )

  // Protocols search object
  search.protocols = protocols.reduce(
    (acc, p) => ({
      doi: [...new Set([...acc.doi, p.doi])],
      author: [...new Set([...acc.author, p.author])],
      publisher: [...new Set([...acc.publisher, p.publisher])],
      title: [...new Set([...acc.title, p.title])],
      publish_date: [...new Set([...acc.publish_date, p.publish_date])],
      publish_year: [...new Set([...acc.publish_year, p.publish_year])],
      category: [...new Set([...acc.category, p.category])],
      domain: [...new Set([...acc.domain, p.domain])]
    }),
    {
      doi: [],
      author: [],
      publisher: [],
      title: [],
      publish_date: [],
      publish_year: [],
      category: [],
      domain: []
    }
  )

  console.log('Metadata search', search)

  /**
   * An array or results that correspond to each executor
   * [executor1Results, executor2Results, etc]
   */
  const searchResults = await Promise.all(
    executors.map(
      filename =>
        new Promise((resolve, reject) => {
          const worker = new Worker(`${__dirname}/executors/${filename}`, { workerData: search })
          worker.on('message', resolve)
          worker.on('error', reject)
          worker.on('exit', code => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`))
          })
        })
    )
  )

  return executors.map((filename, i) => ({
    i,
    target: targets[filename.match(/(.*)\.([^.]*)$/, '')[1]] || filename,
    result: searchResults[i]?.error || searchResults[i] || null,
    error: searchResults[i]?.error || null
  }))
}
