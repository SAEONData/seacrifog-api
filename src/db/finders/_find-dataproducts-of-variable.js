import DataLoader from 'dataloader'
import sift from 'sift'

export default pool =>
  new DataLoader(async keys =>
    keys.map(
      async key =>
        (
          await pool.query(`
            select
            d.id,
            d.title,
            d.publish_year,
            d.publish_date,
            d.keywords,
            d.abstract,
            d.provider,
            d.author,
            d.contact,
            ST_AsGeoJSON(st_transform(d.coverage_spatial, 4326)) coverage_spatial,
            d.coverage_temp_start,
            d.coverage_temp_end,
            d.res_spatial,
            d.res_spatial_unit,
            d.res_temperature,
            d.res_temperature_unit,
            d.uncertainty,
            d.uncertainty_unit,
            d.doi,
            d.license,
            d.url_download,
            d.file_format,
            d.file_size,
            d.file_size_unit,
            d.url_info,
            d.created_by,
            d.created_at,
            d.modified_by,
            d.modified_at,
            d.present,    
            x.variable_id
            from public.dataproduct_variable_xref x
            join public.dataproducts d on d.id = x.dataproduct_id
            where x.variable_id in (${keys.join(',')});`)
        ).rows.filter(sift({ variable_id: key })) || [],
      {
        batch: true,
        maxBatchSize: 250,
        cache: true
      }
    )
  )
