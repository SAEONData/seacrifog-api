import { pickBy } from 'ramda'
import { log, logError } from '../../lib/log'

// TODO: Strings need to be escaped and handled properly

/**
 * args.input
 * [{input1}, {input2}, etc]
 */
export default async (self, args, req) => {
  const { pool } = await req.ctx.db
  const { findVariables } = req.ctx.db.dataLoaders
  const { input: inputs } = args
  const nonDynamicUpdateCols = [
    'id',
    'addDataproducts',
    'removeDataproducts',
    'addDirectlyRelatedProtocols',
    'addIndirectlyRelatedProtocols',
    'removeProtocols',
    'addRForicings',
    'removeRForcings'
  ]

  for (const input of inputs) {
    const {
      addDataproducts,
      removeDataproducts,
      addDirectlyRelatedProtocols,
      addIndirectlyRelatedProtocols,
      removeProtocols,
      addRForicings,
      removeRForcings
    } = input

    // Update the Variable entity
    const update = pickBy((v, k) => (nonDynamicUpdateCols.includes(k) ? false : true), input)

    let fieldUpdateResult
    try {
      fieldUpdateResult =
        Object.keys(update).length > 0
          ? await pool.query(`
        update public.variables
        set ${Object.keys(update)
          .map(attr => `${attr} = '${input[attr]}'`)
          .join(',')}
        where id = ${input.id}`)
          : null
    } catch (error) {
      logError(error)
    }
    log(fieldUpdateResult)

    // Add dataproducts
    if (addDataproducts)
      await pool.query(`
      insert into public.dataproduct_variable_xref
      (dataproduct_id, variable_id)
      values (${addDataproducts.map(dId => [dId, input.id]).join('),(')})
      on conflict on constraint dataproduct_variable_xref_unique_cols do nothing;`)

    // Remove dataproducts
    if (removeDataproducts)
      await pool.query(`
      delete from public.dataproduct_variable_xref
      where
      variable_id = ${input.id}
      and dataproduct_id in (${removeDataproducts.join(',')})`)

    // Add RForcings
    if (addRForicings)
      await pool.query(`
        insert into public.rforcing_variable_xref
        (rforcing_id, variable_id)
        values (${addRForicings.map(rId => [rId, input.id]).join('),(')})
        on conflict on constraint rforcings_variable_xref_unique_cols do nothing;`)

    // Remove RForcings
    if (removeRForcings)
      await pool.query(`
        delete from public.rforcing_variable_xref
        where
        variable_id = ${input.id}
        and rforcing_id in (${removeRForcings.join(',')});`)

    // Add protocols
    if (addDirectlyRelatedProtocols || addIndirectlyRelatedProtocols) {
      const updates = (addDirectlyRelatedProtocols || [])
        .map(id => [id, 'direct'])
        .concat((addIndirectlyRelatedProtocols || []).map(id => [id, 'indirect']))

      await pool.query(`
        insert into protocol_variable_xref
        (protocol_id, variable_id, relationship_type_id)
        values (${updates
          .map(u => [
            u[0],
            input.id,
            `(select id from public.relationship_types where "name" = '${u[1]}')`
          ])
          .join('),(')})
          on conflict on constraint protocol_variable_xref_unique_cols do nothing;`)
    }

    // Remove protocols
    if (removeProtocols)
      await pool.query(`
      delete from public.protocol_variable_xref
      where
      variable_id = ${input.id}
      and protocol_id in (${removeProtocols.join(',')});`)
  }

  // Return the updated rows
  const updatedRows = []
  for (const input of inputs) {
    const result = await findVariables(input.id)
    updatedRows.push(result[0])
  }

  return updatedRows
}
