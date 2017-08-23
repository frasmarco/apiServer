-- Database: dev

-- DROP DATABASE dev;

CREATE DATABASE dev
    WITH 
    OWNER = api
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

ALTER DATABASE dev
    SET search_path TO "$user", public, private, postgis;

ALTER DEFAULT PRIVILEGES
GRANT EXECUTE ON FUNCTIONS TO api;