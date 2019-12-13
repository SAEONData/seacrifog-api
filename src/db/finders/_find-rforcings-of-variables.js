import DataLoader from 'dataloader'
import sift from 'sift'

export default pool =>
  new DataLoader(
    async keys =>
      keys.map(
        async key =>
          (
            await pool.query(`
              select rf.*,
              x.variable_id
              from public.rforcing_variable_xref x
              join public.rforcings rf on rf.id = x.rforcing_id
              where x.variable_id in (${keys.join(',')});`)
          ).rows.filter(sift({ variable_id: key })) || []
      ),
    {
      batch: true,
      maxBatchSize: 250,
      cache: true
    }
  )
