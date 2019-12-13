import DataLoader from 'dataloader'
import sift from 'sift'

export default pool =>
  new DataLoader(async keys =>
    keys.map(
      async key =>
        (
          await pool.query(`
              select
              id,
              title,
              acronym,
              "type",
              status,
              start_year,
              end_year,
              url_info_id,
              url_data_id,
              abstract,
              ST_AsGeoJSON(st_transform(coverage_spatial, 4326)) coverage_spatial,
              url_sites_id,
              parent_id,
              created_by,
              created_at,
              modified_by,
              modified_at
              from public.networks where id in (${keys.join(',')});`)
        ).rows.filter(sift({ id: key })) || [],
      {
        batch: true,
        maxBatchSize: 250,
        cache: true
      }
    )
  )
