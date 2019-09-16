import { pickBy } from 'ramda'

/**
 * args.input
 * [{input1}, {input2}, etc]
 */
export default async (self, args, req) => {
  const { pool } = await req.ctx.db
  const { findProtocols } = req.ctx.db.dataLoaders
  const { input: inputs } = args
  const nonDynamicUpdateCols = [
    'id',
    'addDirectlyRelatedVariables',
    'addIndirectlyRelatedVariables',
    'removeVariables'
  ]

  for (const input of inputs) {
    const { addDirectlyRelatedVariables, addIndirectlyRelatedVariables, removeVariables } = input

    // Update the Protocol entity
    const update = pickBy((v, k) => (nonDynamicUpdateCols.includes(k) ? false : true), input)
    if (Object.keys(update).length > 0)
      await pool.query(`
      update public.protocols
      set ${Object.keys(update)
        .map(attr => `${attr} = '${input[attr]}'`)
        .join(',')}
      where id = ${input.id}`)

    // Add Variables
    if (addDirectlyRelatedVariables || addIndirectlyRelatedVariables) {
      const updates = (addDirectlyRelatedVariables || [])
        .map(id => [id, 'direct'])
        .concat((addIndirectlyRelatedVariables || []).map(id => [id, 'indirect']))

      await pool.query(`
        insert into protocol_variable_xref
        (protocol_id, variable_id, relationship_type_id)
        values (${updates
          .map(u => [
            input.id,
            u[0],
            `(select id from public.relationship_types where "name" = '${u[1]}')`
          ])
          .join('),(')})
          on conflict on constraint protocol_variable_xref_unique_cols do nothing;`)
    }

    // Remove Variables
    if (removeVariables)
      await pool.query(`
      delete from public.protocol_variable_xref
      where
      protocol_id = ${input.id}
      and variable_id in (${removeVariables.join(',')});`)
  }

  // Return the updated rows
  const updatedRows = []
  for (const input of inputs) {
    const result = await findProtocols(input.id)
    updatedRows.push(result[0])
  }

  return updatedRows
}
