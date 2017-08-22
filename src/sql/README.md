This directory holds sql files to build pg schema.
Scripts must be loaded in order.

    REVOKE UPDATE ON public.user_profile FROM registered;
    GRANT UPDATE(first_name, last_name,display_name,picture,gender,location,website)
    ON public.user_profile TO registered;
