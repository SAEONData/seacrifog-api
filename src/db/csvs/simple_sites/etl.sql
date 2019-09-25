insert into public.sites
select
trim(public.get_substring(st."Name", '-', 2)) code,
trim(public.get_substring(st."Name", '-', 1)) "name",
"Latitude" latitude,
"Longitude" longitude
from saws_temp st
