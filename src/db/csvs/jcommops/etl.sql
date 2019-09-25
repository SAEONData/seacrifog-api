delete from public.site_network_xref;
delete from public.sites;

/**
 * (1) Update the sites table
 */
;with jcommops as (
  select
  "Country" country,
  "Station" station,
  ST_SetSRID(ST_MakePoint(cast("Longitude" as float), cast("Latitude" as float)), 4326) lng_lat,
  'ARGO' "network"
  from  jcommops_argo_temp
  union select
  "Country" country,
  "Station" station,
  ST_SetSRID(ST_MakePoint(cast("Longitude" as float), cast("Latitude" as float)), 4326) lng_lat,
  'DBCP' "network"
  from  jcommops_dbcp_temp
  union
  select
  "Country" country,
  "Station" station,
  ST_SetSRID(ST_MakePoint(cast("Longitude" as float), cast("Latitude" as float)), 4326) lng_lat,
  'GOOS' "network"
  from  jcommops_goos_temp
  union
  select
  "Country" country,
  "Station" station,
  ST_SetSRID(ST_MakePoint(cast("Longitude" as float), cast("Latitude" as float)), 4326) lng_lat,
  'SOT' "network"
  from  jcommops_sot_temp
)

insert into public.sites ("name", lng_lat)
select distinct
station "name",
lng_lat
from jcommops j;


/**
 * Update the sites-networks mappings
 */
;with jcommops as (
  select
  "Country" country,
  "Station" station,
  ST_SetSRID(ST_MakePoint(cast("Longitude" as float), cast("Latitude" as float)), 4326) lng_lat,
  'ARGO' "network"
  from  jcommops_argo_temp
  union select
  "Country" country,
  "Station" station,
  ST_SetSRID(ST_MakePoint(cast("Longitude" as float), cast("Latitude" as float)), 4326) lng_lat,
  'DBCP' "network"
  from  jcommops_dbcp_temp
  union
  select
  "Country" country,
  "Station" station,
  ST_SetSRID(ST_MakePoint(cast("Longitude" as float), cast("Latitude" as float)), 4326) lng_lat,
  'GOOS' "network"
  from  jcommops_goos_temp
  union
  select
  "Country" country,
  "Station" station,
  ST_SetSRID(ST_MakePoint(cast("Longitude" as float), cast("Latitude" as float)), 4326) lng_lat,
  'SOT' "network"
  from  jcommops_sot_temp
)

insert into public.site_network_xref (site_id, network_id)
select
s.id site_id,
n.id network_id
from jcommops j
join networks n on upper(n.acronym) = upper(j.network)
join sites s on UPPER(s."name") = upper(j.station);