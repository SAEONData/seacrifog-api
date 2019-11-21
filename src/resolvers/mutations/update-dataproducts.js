import { pickBy } from 'ramda'

/**
 * args.input
 * [{input1}, {input2}, etc]
 */
export default async (self, args, req) => {
  const { pool } = await req.ctx.db
  const { findDataproducts } = req.ctx.db.dataLoaders
  const { input: inputs } = args
  const nonDynamicUpdateCols = ['id', 'newVariables', 'removeVariables']

  for (const input of inputs) {
    const { addVariables, removeVariables } = input
    // Update the Dataproduct entity
    const update = pickBy((v, k) => (nonDynamicUpdateCols.includes(k) ? false : true), input)
    if (Object.keys(update).length > 0) console.log('1.2')
    await pool.query(`
      update public.dataproducts
      set ${Object.keys(update)
        .map(attr => `${attr} = '${input[attr]}'`)
        .join(',')}
      where id = ${input.id};`)
    // Add new variable mappings
    if (addVariables)
      await pool.query(`
      insert into public.dataproduct_variable_xref
      (dataproduct_id, variable_id)
      values (${addVariables.map(vId => [input.id, vId]).join('),(')})
      on conflict on constraint dataproduct_variable_xref_unique_cols do nothing;`)
    // Remove old variable mappings
    if (removeVariables)
      await pool.query(`
      delete from public.dataproduct_variable_xref
      where
      dataproduct_id = ${input.id}
      and variable_id in (${removeVariables.join(',')});`)
  }
  // Return the updated rows
  const updatedRows = []
  for (const input of inputs) {
    const result = await findDataproducts(input.id)
    updatedRows.push(result[0])
  }
  return updatedRows
}
