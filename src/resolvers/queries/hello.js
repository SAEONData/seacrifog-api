import pool from '../../pg'
import { log, error } from '../../log'

export default async () => {
  const result = await pool.query(`select 'hello world from postgres' cola`)
  return result.rows[0].cola
}
