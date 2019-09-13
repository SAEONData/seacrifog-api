import { pickBy } from 'ramda'

/**
 * args.input
 * [{input1}, {input2}, etc]
 */
export default async (self, args, req) => {
  const { pool } = await req.ctx.db
  const { findProtocols } = req.ctx.db.dataLoaders
  const { input: inputs } = args

  // TODO: This might not be the right place for this SQL
  // Move to dataloaders?
  for (const input of inputs) {
    await pool.query(`
    update public.protocols
    set ${Object.keys(pickBy((v, k) => (k !== 'id' ? true : false), input))
      .map(attr => `${attr} = '${input[attr]}'`)
      .join(',')}
    where id = ${input.id}`)
  }

  // Return the updated rows
  const updatedRows = []
  for (const input of inputs) {
    const result = await findProtocols(input.id)
    updatedRows.push(result[0])
  }

  return updatedRows
}
