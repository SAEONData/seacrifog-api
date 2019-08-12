import pool from '../../pg'
import { log, error } from '../../log'

export default async args => {
  const result = await pool.query(`select id, name, class, domain from variables`)
  return result.rows
}
