-- User profile

ALTER TABLE public.user_profile
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_profile_pol_sel ON "public"."user_profile" FOR SELECT TO anonymous
  USING (TRUE);

CREATE POLICY user_profile_pol_upd ON "public"."user_profile" FOR UPDATE TO registered
  USING (user_id = current_setting('jwt.claims.user_id')::uuid);

CREATE POLICY user_profile_pol_adm ON "public"."user_profile" TO administrator
  USING (TRUE);
