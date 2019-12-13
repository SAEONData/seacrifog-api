import DataLoader from 'dataloader'
import sift from 'sift'

export default pool =>
  new DataLoader(
    async keys =>
      keys.map(
        async key =>
          (
            await pool.query(`select * from public.protocols where id in (${keys.join(',')});`)
          ).rows.filter(sift({ id: key })) || []
      ),
    {
      batch: true,
      maxBatchSize: 250,
      cache: true
    }
  )
