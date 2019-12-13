import DataLoader from 'dataloader'
import sift from 'sift'

export default pool =>
  new DataLoader(async keys =>
    keys.map(
      async key =>
        (
          await pool.query(`
            select
            v.*,
            x.network_id
            from public.network_variable_xref x
            join public.variables v on v.id = x.variable_id
            where x.network_id in (${keys.join(',')});`)
        ).rows.filter(sift({ network_id: key })) || [],
      {
        batch: true,
        maxBatchSize: 250,
        cache: true
      }
    )
  )
