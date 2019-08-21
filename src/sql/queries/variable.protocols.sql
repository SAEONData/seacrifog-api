select
p.*

from
public.protocols p
join public.protocol_variable_xref x on x.protocol_id = p.id
join public.variables v on v.id = x.variable_id
where v.id = :1