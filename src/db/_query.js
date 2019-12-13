import { Query } from 'pg'

export default async ({ pool, text, values, name }) => {
  const client = await pool.connect()
  try {
    await new Promise((resolve, reject) => {
      client.query(
        new Query(
          {
            text,
            values,
            name
          },
          (err, result) => (err ? reject(err) : resolve(result))
        )
      )
    })
  } catch (error) {
    throw error
  } finally {
    client.release()
  }
}
