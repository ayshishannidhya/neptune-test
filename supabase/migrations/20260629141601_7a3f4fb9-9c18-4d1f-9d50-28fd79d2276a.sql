
-- 1. Customers: prevent self-update of sensitive fields via trigger
CREATE OR REPLACE FUNCTION public.guard_customer_sensitive_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_staff(auth.uid()) THEN
    RETURN NEW;
  END IF;
  IF NEW.is_blocked IS DISTINCT FROM OLD.is_blocked
     OR NEW.is_deleted IS DISTINCT FROM OLD.is_deleted
     OR NEW.is_active IS DISTINCT FROM OLD.is_active
     OR NEW.account_interest_rate IS DISTINCT FROM OLD.account_interest_rate
     OR NEW.salary IS DISTINCT FROM OLD.salary
     OR NEW.category IS DISTINCT FROM OLD.category
     OR NEW.profile_id IS DISTINCT FROM OLD.profile_id THEN
    RAISE EXCEPTION 'Only staff may modify restricted customer fields';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_customer_sensitive ON public.customers;
CREATE TRIGGER trg_guard_customer_sensitive
BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.guard_customer_sensitive_fields();

-- 2. OTPs: revoke client writes; only service role / SECURITY DEFINER fns may write
REVOKE INSERT, UPDATE, DELETE ON public.otps FROM authenticated, anon;

-- 3. Transactions: revoke direct writes; balance-mutating SECURITY DEFINER fns insert rows
REVOKE INSERT, UPDATE, DELETE ON public.transactions FROM authenticated, anon;

-- 4. user_roles: prevent self-assigned roles; only service role may write
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated, anon;

-- 5. SECURITY DEFINER functions: revoke from anon/public; keep authenticated only where intended
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_customer_sensitive_fields() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;

REVOKE ALL ON FUNCTION public.fn_deposit(uuid, numeric, transaction_medium, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_withdraw(uuid, numeric, transaction_medium, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_transfer(uuid, text, numeric, transaction_medium, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_open_account(uuid, account_type, numeric) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_deposit(uuid, numeric, transaction_medium, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_withdraw(uuid, numeric, transaction_medium, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_transfer(uuid, text, numeric, transaction_medium, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_open_account(uuid, account_type, numeric) TO authenticated;
