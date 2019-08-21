select
v.*

from public.variables v
join public.protocol_variable_xref x on x.variable_id = v.id
join public.protocols p on p.id = x.protocol_id
where p.id = :1