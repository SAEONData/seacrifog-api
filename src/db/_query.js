import createPool from '../db/_pool'
var pool

export default ({ text, values, name }) => {
  if (!pool) {
    pool = createPool()
  }
  return new Promise((resolve, reject) =>
    pool
      .connect()
      .then(client =>
        client
          .query({ text, values, name })
          .then(res => resolve(res))
          .then(() => client)
      )
      .then(client => client.release())
      .catch(err => reject(err))
  )
}
