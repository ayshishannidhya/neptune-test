
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

REVOKE EXECUTE ON FUNCTION public.fn_deposit(UUID, NUMERIC, public.transaction_medium, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.fn_withdraw(UUID, NUMERIC, public.transaction_medium, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.fn_transfer(UUID, TEXT, NUMERIC, public.transaction_medium, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.fn_deposit(UUID, NUMERIC, public.transaction_medium, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_withdraw(UUID, NUMERIC, public.transaction_medium, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_transfer(UUID, TEXT, NUMERIC, public.transaction_medium, TEXT) TO authenticated;
