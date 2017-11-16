Table population notes

shp2pgsql -a -s 32632 Com2016_WGS84.shp public.italy_comune > italy_comune.sql
update italy_comune set flag_cm = 0 where flag_cm=2;
ALTER TABLE public.italy_comune ALTER COLUMN flag_cm TYPE BOOLEAN USING flag_cm::boolean;
update italy_comune set cod_cm = null where cod_cm = 0 and flag_cm = false;
