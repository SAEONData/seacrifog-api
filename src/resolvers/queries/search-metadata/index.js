import { Worker } from 'worker_threads'

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

  // Search SAEON
  const data = await new Promise((resolve, reject) => {
    const worker = new Worker(__dirname + '/executors/_saeon-search.js', {
      workerData: search,
      type: 'module'
    })
    worker.on('message', resolve)
    worker.on('error', reject)
    worker.on('exit', code => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`))
    })
  })

  return data.results.map((item, i) => ({ id: i + 1 }))
}
