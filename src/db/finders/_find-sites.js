import DataLoader from 'dataloader'
import sift from 'sift'
import query from '../_query'

export default pool =>
  new DataLoader(
    async keys =>
      keys.map(
        async key =>
          (
            await query({
              pool,
              text: `
                select
                id,
                "name",
                ST_AsGeoJSON(st_transform(xyz, 4326)) xyz
                from public.sites
                where id in (${keys.map((k, i) => `$${i + 1}`).join(',')});`,
              values: keys.map(k => k)
            })
          ).rows.filter(sift({ id: key })) || []
      ),
    {
      batch: true,
      maxBatchSize: 250,
      cache: true
    }
  )
