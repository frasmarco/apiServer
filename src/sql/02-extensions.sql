-- Extension: pgcrypto

-- DROP EXTENSION pgcrypto;

CREATE EXTENSION pgcrypto
    SCHEMA private;

-- Extension: postgis

-- DROP EXTENSION postgis;

CREATE EXTENSION postgis
    SCHEMA postgis;

-- Extension: unaccent

-- DROP EXTENSION unaccent;

CREATE EXTENSION unaccent
    SCHEMA private;

-- Extension: "uuid-ossp"

-- DROP EXTENSION "uuid-ossp";

CREATE EXTENSION "uuid-ossp"
    SCHEMA private;