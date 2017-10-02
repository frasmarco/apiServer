-- Table: public.file

-- DROP TABLE public.file;

CREATE TABLE public.file
(
    md5 uuid NOT NULL,
    mime_type character varying(30) COLLATE pg_catalog."default" NOT NULL,
    name character varying COLLATE pg_catalog."default" NOT NULL,
    size integer NOT NULL DEFAULT 0 CHECK (size >= 0),
    is_image boolean NOT NULL DEFAULT false,
    has_thumbnail boolean NOT NULL DEFAULT false,
    has_miniature boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc', now()),
    created_by uuid REFERENCES public.user_profile (user_id) NOT NULL,
    deleted boolean DEFAULT false,
    CONSTRAINT file_pkey PRIMARY KEY (md5),
    CONSTRAINT file_is_image_check CHECK ((is_image AND mime_type LIKE 'image/%') OR (NOT is_image AND NOT mime_type LIKE 'image/%')),
    CONSTRAINT file_has_thumbnail_check CHECK (NOT (NOT is_image AND has_thumbnail)),
    CONSTRAINT file_has_miniature_check CHECK (NOT (NOT has_thumbnail AND has_miniature))
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.file
    OWNER to api;
COMMENT ON TABLE public.file
    IS 'Every uploaded file goes here. Nobody can UPDATE or DELETE records, files cannot be deleted.';

COMMENT ON COLUMN public.file.md5
    IS 'MD5 hash of file contents';

COMMENT ON COLUMN public.file.mime_type
    IS 'Mime Type derived from actual file contents';

COMMENT ON COLUMN public.file.name
    IS 'Original filename';

COMMENT ON COLUMN public.file.size
    IS 'File size in bytes, max 2GB';

COMMENT ON COLUMN public.file.is_image
    IS 'True if mime_type starts with image/*';

COMMENT ON COLUMN public.file.has_thumbnail
    IS 'True if is_image and thumbnail has been created and uploaded to S3';

COMMENT ON COLUMN public.file.has_miniature
    IS 'True if is_image, has_thumbnail and miniature has been created and uploaded to S3';

COMMENT ON COLUMN public.file.created_at
    IS 'Upload timestamp';

COMMENT ON COLUMN public.file.created_by
    IS 'User who FIRST uploaded this file';

COMMENT ON CONSTRAINT file_is_image_check ON public.file
    IS 'Ensures that mime_type and is_image are congruent';
COMMENT ON CONSTRAINT file_has_thumbnail_check ON public.file
    IS 'If file is not an image cannot have thumbnails';
COMMENT ON CONSTRAINT file_has_miniature_check ON public.file
    IS 'No miniature without thumbnail';