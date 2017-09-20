
CREATE TABLE public.file (
  md5 UUID,
  mime_type VARCHAR(30) NOT NULL,
  filename INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID NOT NULL REFERENCES public.user_profile(user_id),
  deleted BOOLEAN DEFAULT false,
  PRIMARY KEY(md5)
) 
WITH (oids = false);

COMMENT ON COLUMN public.file.md5
IS 'MD5 hash of file contents';

COMMENT ON COLUMN public.file.mime_type
IS 'Mime Type derived from actual file contents';

COMMENT ON COLUMN public.file.filename
IS 'Original filename';
