-- User: api
-- DROP USER api;

CREATE USER api WITH
  LOGIN
  SUPERUSER
  INHERIT
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION;

-- Role: anonymous
-- DROP ROLE anonymous;

CREATE ROLE anonymous WITH
  NOLOGIN
  NOSUPERUSER
  INHERIT
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION;

COMMENT ON ROLE anonymous IS 'Default role for unauthenticated users';

-- Role: registered
-- DROP ROLE registered;

CREATE ROLE registered WITH
  NOLOGIN
  NOSUPERUSER
  INHERIT
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION;

GRANT anonymous TO registered;

COMMENT ON ROLE registered IS 'Registered users. The only difference with anonymous users is that they have access to own profile.';

-- Role: administrator
-- DROP ROLE administrator;

CREATE ROLE administrator WITH
  NOLOGIN
  NOSUPERUSER
  INHERIT
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION;

GRANT registered TO administrator;

COMMENT ON ROLE administrator IS 'Members of this role can do anything';