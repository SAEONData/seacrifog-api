export default async ({ pool, text, values, name }) => {
  let client
  let result
  try {
    client = await pool.connect()
    result = await client.query({ text, values, name })
  } catch (error) {
    throw error
  } finally {
    console.log('releasing')
    console.log(client.release())
  }
  return result
}
