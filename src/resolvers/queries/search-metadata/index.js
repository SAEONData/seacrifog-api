import { Worker } from 'worker_threads'
import { readdirSync } from 'fs'

/**
 * A list of executors to search metadata endpoints
 */
const executors = readdirSync(__dirname + '/executors').filter(
  filename => filename.indexOf('s_example') !== 0
)

/**
 * Target name  maps
 */
const targets = {
  _saeon: 'SAEON CKAN: saeon-odp-4-2'
}

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

  /**
   * An array or results that correspond to each executor
   * [{saeon search results}, etc]
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

  // Currently only dealing with SAEON seach results
  return executors.map((filename, i) => ({
    id: i,
    target: targets[filename.match(/(.*)\.([^.]*)$/, '')[1]] || filename,
    result: searchResults[i]
  }))
}
