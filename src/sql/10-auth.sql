-- Type: jwt_token

-- DROP TYPE public.jwt_token;

CREATE TYPE public.jwt_token AS
(
	role text,
	user_id uuid
);

ALTER TYPE public.jwt_token
    OWNER TO api;

-- FUNCTION: public."current_user"()

-- DROP FUNCTION public."current_user"();

CREATE OR REPLACE FUNCTION public.update_updated_at (
)
RETURNS trigger AS
$body$
BEGIN
   NEW.updated_at = timezone('utc'::text, now());
   RETURN NEW;
END;
$body$
LANGUAGE 'plpgsql'
VOLATILE
CALLED ON NULL INPUT
SECURITY INVOKER;

-- Table: private.user_account

-- DROP TABLE private.user_account;

CREATE TABLE private.user_account
(
    id uuid NOT NULL DEFAULT uuid_generate_v1mc(),
    email character varying(256) COLLATE pg_catalog."default" NOT NULL,
    email_confirmed boolean NOT NULL DEFAULT false,
    password_hash character varying(100) COLLATE pg_catalog."default",
    security_stamp character varying(100) COLLATE pg_catalog."default",
    concurrency_stamp uuid NOT NULL DEFAULT uuid_generate_v4(),
    phone_number character varying(50) COLLATE pg_catalog."default",
    phone_number_confirmed boolean NOT NULL DEFAULT false,
    two_factor_enabled boolean NOT NULL DEFAULT false,
    lockout_end timestamp without time zone,
    lockout_enabled boolean NOT NULL DEFAULT false,
    access_failed_count smallint NOT NULL DEFAULT 0,
    role character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'registered'::character varying,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT user_account_pkey PRIMARY KEY (id),
    CONSTRAINT user_account_email_key UNIQUE (email)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE private.user_account
    OWNER to api;

-- Trigger: update_updated_at

-- DROP TRIGGER update_updated_at ON private.user_account;

CREATE TRIGGER update_updated_at
    BEFORE UPDATE 
    ON private.user_account
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at();

-- Table: public.user_profile

-- DROP TABLE public.user_profile;

CREATE TABLE public.user_profile
(
    user_id uuid NOT NULL,
    first_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    last_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    display_name character varying(100) COLLATE pg_catalog."default",
    picture character varying(256) COLLATE pg_catalog."default",
    gender character varying(50) COLLATE pg_catalog."default",
    location character varying(100) COLLATE pg_catalog."default",
    website character varying(256) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT user_profile_pkey PRIMARY KEY (user_id),
    CONSTRAINT user_profile_user_account_fkey FOREIGN KEY (user_id)
        REFERENCES private.user_account (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.user_profile
    OWNER to postgres;

GRANT SELECT, DELETE, UPDATE ON TABLE public.user_profile TO administrator;

GRANT SELECT ON TABLE public.user_profile TO anonymous;

GRANT ALL ON TABLE public.user_profile TO postgres;

GRANT SELECT, UPDATE, DELETE ON TABLE public.user_profile TO registered;

-- Trigger: update_updated_at

-- DROP TRIGGER update_updated_at ON public.user_profile;

CREATE TRIGGER update_updated_at
    BEFORE UPDATE 
    ON public.user_profile
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at();

-- Table: public.user_login

-- DROP TABLE public.user_login;

CREATE TABLE public.user_login
(
    provider character varying(50) COLLATE pg_catalog."default" NOT NULL,
    key character varying(100) COLLATE pg_catalog."default" NOT NULL,
    user_id uuid NOT NULL,
    tokens jsonb,
    profile jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT user_login_pkey PRIMARY KEY (provider, key),
    CONSTRAINT user_login_user_account_fkey FOREIGN KEY (user_id)
        REFERENCES private.user_account (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT user_login_user_profile_fk FOREIGN KEY (user_id)
        REFERENCES public.user_profile (user_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT user_login_provider_chk CHECK (provider::text = lower(provider::text))
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.user_login
    OWNER to postgres;
COMMENT ON TABLE public.user_login
    IS 'External logins with security tokens (e.g. Google, Facebook, Twitter)';

COMMENT ON COLUMN public.user_login.provider
    IS 'Provider identifier (e.g. Google, Facebook, Twitter)';

COMMENT ON COLUMN public.user_login.key
    IS 'Provider specific user identifier';

COMMENT ON COLUMN public.user_login.tokens
    IS 'Provider''s tokens';

COMMENT ON COLUMN public.user_login.profile
    IS 'Profile from provider.';

-- Trigger: update_updated_at

-- DROP TRIGGER update_updated_at ON public.user_login;

CREATE TRIGGER update_updated_at
    BEFORE UPDATE 
    ON public.user_login
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at();

-- FUNCTION: public.authenticate(text, text)

-- DROP FUNCTION public.authenticate(text, text);

CREATE OR REPLACE FUNCTION public.authenticate(
	email text,
	password text)
    RETURNS jwt_token
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE STRICT SECURITY DEFINER 
    
AS $BODY$

declare
  account private.user_account;
begin
  select a.* into account
  from private.user_account as a
  where a.email = $1;

  if account.password_hash = crypt(password, account.password_hash) then
    return ('registered', account.id)::public.jwt_token;
  else
    return NULL;
  end if;
end;

$BODY$;

ALTER FUNCTION public.authenticate(text, text)
    OWNER TO api;

GRANT EXECUTE ON FUNCTION public.authenticate(text, text) TO anonymous;

GRANT EXECUTE ON FUNCTION public.authenticate(text, text) TO api;

REVOKE ALL ON FUNCTION public.authenticate(text, text) FROM PUBLIC;

COMMENT ON FUNCTION public.authenticate(text, text)
    IS 'Creates a JWT token that will securely identify the user and give them certain permissions.';

-- FUNCTION: public.register_user(text, text, text, text)

-- DROP FUNCTION public.register_user(text, text, text, text);

CREATE OR REPLACE FUNCTION public.register_user(
	first_name text,
	last_name text,
	email text,
	password text)
    RETURNS user_profile
    LANGUAGE 'plpgsql'

    VOLATILE STRICT SECURITY DEFINER 
    
AS $BODY$

declare
  user_profile public.user_profile;
  user_account private.user_account;
begin
  INSERT INTO private.user_account (email, password_hash) VALUES
    (email, crypt(password, gen_salt('bf')))
    RETURNING * INTO user_account;
    
  INSERT INTO public.user_profile(user_id, first_name, last_name, display_name) VALUES
    (user_account.id, first_name, last_name, concat(first_name, ' ', last_name))
    RETURNING * INTO user_profile;

  return user_profile;
end;

$BODY$;

ALTER FUNCTION public.register_user(text, text, text, text)
    OWNER TO api;

GRANT EXECUTE ON FUNCTION public.register_user(text, text, text, text) TO api;

REVOKE ALL ON FUNCTION public.register_user(text, text, text, text) FROM PUBLIC;

COMMENT ON FUNCTION public.register_user(text, text, text, text)
    IS 'Registers a single user and creates an account.';
-- FUNCTION: public."current_user"()

-- DROP FUNCTION public."current_user"();

CREATE OR REPLACE FUNCTION public.current_user(
	)
    RETURNS user_profile
    LANGUAGE 'sql'

    STABLE 
    
AS $BODY$

  select *
  from public.user_profile
  where user_id = current_setting('jwt.claims.user_id')::uuid

$BODY$;

ALTER FUNCTION public."current_user"()
    OWNER TO api;

GRANT EXECUTE ON FUNCTION public."current_user"() TO registered;

GRANT EXECUTE ON FUNCTION public."current_user"() TO api;

REVOKE ALL ON FUNCTION public."current_user"() FROM PUBLIC;

COMMENT ON FUNCTION public."current_user"()
    IS 'Gets the user who was identified by our JWT.';
