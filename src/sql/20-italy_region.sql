-- Table: public.italy_region

-- DROP TABLE public.italy_region;

CREATE TABLE public.italy_region
(
    id serial,
    cod_reg bigint,
    regione character varying(50) COLLATE pg_catalog."default",
    shape_leng double precision,
    shape_area double precision,
    PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
SELECT AddGeometryColumn('public','italy_region','geom',32632,'MULTIPOLYGON',2);

CREATE INDEX "sidx_italy_region_geom"
    ON public.italy_region USING gist
    (geom)
    TABLESPACE pg_default;

CREATE function italy_region_geojson(italy_region italy_region) returns text as $$
  select ST_AsGeoJSON(italy_region.geom)
$$ language sql stable;

ALTER TABLE public.italy_region
    OWNER to api;

GRANT SELECT ON TABLE public.italy_region TO anonymous;
GRANT EXECUTE
  ON FUNCTION public.italy_region_geojson(italy_region public.italy_region) TO anonymous;
