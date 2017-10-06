-- Table: public.geologic_era

-- DROP TABLE public.geologic_era;

CREATE TABLE public.geologic_era (
  id INTEGER,
  name_en VARCHAR(50),
  name_it VARCHAR(50),
  PRIMARY KEY(id)
) 
WITH (oids = false);

COMMENT ON COLUMN public.geologic_era.name_en
IS 'Name in English';

COMMENT ON COLUMN public.geologic_era.name_it
IS 'Name in Italian';

-- COMMENT ON COLUMN public.geologic_era.m_years_start
-- IS 'How many years ago started (Millions)';

-- COMMENT ON COLUMN public.geologic_era.m_years_end
-- IS 'How many years ago ended (Millions)';

GRANT SELECT
  ON public.geologic_era TO registered;