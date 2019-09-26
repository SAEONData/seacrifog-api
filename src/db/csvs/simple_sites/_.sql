;with sites_temp as (

	select
	"Site_Name" "name",
	ST_SetSRID(st_makepoint(cast("Longitude" as float), cast("Latitude" as float), cast("Elevation" as float)), 4326) xyz,
	'AERONET' network
	from public.simple_sites_aeronet_temp
	
	union
		
	select
	"Station" "name",
	ST_SetSRID(st_makepoint(cast("Longitude" as float), cast("Latitude" as float)), 4326) xyz,
	'AM5' network
	from simple_sites_am5_temp
	
	union
	
	select
	"Station" "name",
	ST_SetSRID(st_makepoint(cast("Longitude" as float), cast("Latitude" as float)), 4326) xyz,
	'NDACC' network
	from simple_sites_ndacc_temp
	
	union
	
	select
	"Station Name" "name",
	ST_SetSRID(st_makepoint(cast("Longitude" as float), cast("Latitude" as float)), 4326) xyz,
	'SAEON' network
	from simple_sites_saeon_temp
	
	union
	
	select
	"Name" "name",
	ST_SetSRID(st_makepoint(cast("Longitude" as float), cast("Latitude" as float)), 4326) xyz,
	'SAWS' network
	from simple_sites_saws_temp

	union
	
	select
	"Name" "name",
	ST_SetSRID(st_makepoint(cast("Longitude" as float), cast("Latitude" as float)), 4326) xyz,
	'SLSMF' network
	from simple_sites_slsmf_temp
)


insert into public.sites ("name", xyz)
select distinct
"name",
xyz
from sites_temp
on conflict on constraint sites_unique_cols do nothing;

;with sites_temp as (

	select
	"Site_Name" "name",
	ST_SetSRID(st_makepoint(cast("Longitude" as float), cast("Latitude" as float), cast("Elevation" as float)), 4326) xyz,
	'AERONET' network
	from public.simple_sites_aeronet_temp
	
	union
		
	select
	"Station" "name",
	ST_SetSRID(st_makepoint(cast("Longitude" as float), cast("Latitude" as float)), 4326) xyz,
	'AM5' network
	from simple_sites_am5_temp
	
	union
	
	select
	"Station" "name",
	ST_SetSRID(st_makepoint(cast("Longitude" as float), cast("Latitude" as float)), 4326) xyz,
	'NDACC' network
	from simple_sites_ndacc_temp
	
	union
	
	select
	"Station Name" "name",
	ST_SetSRID(st_makepoint(cast("Longitude" as float), cast("Latitude" as float)), 4326) xyz,
	'SAEON' network
	from simple_sites_saeon_temp
	
	union
	
	select
	"Name" "name",
	ST_SetSRID(st_makepoint(cast("Longitude" as float), cast("Latitude" as float)), 4326) xyz,
	'SAWS' network
	from simple_sites_saws_temp

	union
	
	select
	"Name" "name",
	ST_SetSRID(st_makepoint(cast("Longitude" as float), cast("Latitude" as float)), 4326) xyz,
	'SLSMF' network
	from simple_sites_slsmf_temp
)

insert into public.site_network_xref (site_id, network_id)
select
s.id site_id,
n.id network_id
from sites_temp ss
join networks n on upper(n.acronym) = upper(ss.network)
join sites s on UPPER(s."name") = upper(ss."name")
on conflict on constraint site_network_xref_unique_cols do nothing;





-- TODO: Some model adjustment is required for several of these tables
-- (1) select "URL" from simple_sites_aeronet_temp
-- (2) select "URL" from simple_sites_am5_temp
-- (3) select "SymbolID", "Status2" from simple_sites_slsmf_temp
-- (4) The AM5 network doesn't exist in the networks table