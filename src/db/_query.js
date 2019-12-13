import { Query } from 'pg'

export default async ({ pool, text, values, name }) => {
  let client
  try {
    client = await pool.connect()
    await client.query({ text, values, name })
  } catch (error) {
    throw error
  } finally {
    if (client) client.release()
  }
}
