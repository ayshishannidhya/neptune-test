
-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'employee', 'user');
CREATE TYPE public.gender AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE public.marital_status AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');
CREATE TYPE public.occupation AS ENUM ('SALARIED', 'SELF_EMPLOYED', 'BUSINESS', 'STUDENT', 'RETIRED', 'HOMEMAKER', 'UNEMPLOYED', 'OTHER');
CREATE TYPE public.category AS ENUM ('GENERAL', 'OBC', 'SC', 'ST', 'OTHER');
CREATE TYPE public.religion AS ENUM ('HINDU', 'MUSLIM', 'CHRISTIAN', 'SIKH', 'BUDDHIST', 'JAIN', 'OTHER');
CREATE TYPE public.relationship AS ENUM ('SPOUSE', 'PARENT', 'SIBLING', 'CHILD', 'OTHER');
CREATE TYPE public.account_type AS ENUM ('SAVINGS', 'CURRENT', 'SALARY', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT');
CREATE TYPE public.mode_of_operation AS ENUM ('SINGLE', 'JOINT', 'EITHER_OR_SURVIVOR', 'FORMER_OR_SURVIVOR');
CREATE TYPE public.transaction_type AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER');
CREATE TYPE public.transaction_medium AS ENUM ('CASH', 'CHEQUE', 'ONLINE', 'CARD', 'UPI', 'NEFT', 'RTGS', 'IMPS');
CREATE TYPE public.transaction_mode AS ENUM ('CREDIT', 'DEBIT');
CREATE TYPE public.transaction_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REVERSED');
CREATE TYPE public.otp_purpose AS ENUM ('LOGIN', 'TRANSFER', 'KYC', 'REGISTRATION');

-- =========================================================
-- HELPER: updated_at trigger
-- =========================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- USER ROLES + has_role()
-- =========================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','employee')
  );
$$;

-- Profile policies
CREATE POLICY "Own profile select" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- user_roles policies (read own; admins manage)
CREATE POLICY "Read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- =========================================================
-- AUTO PROFILE + DEFAULT ROLE on signup
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles(id, username, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)), NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- CUSTOMERS
-- =========================================================
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender public.gender NOT NULL,
  father_name TEXT NOT NULL,
  mother_name TEXT NOT NULL,
  marital_status public.marital_status NOT NULL,
  spouse_name TEXT,
  occupation public.occupation NOT NULL,
  salary NUMERIC(14,2),
  citizen TEXT NOT NULL DEFAULT 'IN',
  category public.category NOT NULL,
  religion public.religion NOT NULL,
  account_interest_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Customer self read" ON public.customers FOR SELECT TO authenticated USING (profile_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "Customer self insert" ON public.customers FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Customer self update" ON public.customers FOR UPDATE TO authenticated USING (profile_id = auth.uid() OR public.is_staff(auth.uid())) WITH CHECK (profile_id = auth.uid() OR public.is_staff(auth.uid()));

-- =========================================================
-- CONTACT DETAILS
-- =========================================================
CREATE TABLE public.contact_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL UNIQUE REFERENCES public.customers(id) ON DELETE CASCADE,
  mobile_number TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  communication_address TEXT NOT NULL,
  permanent_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  landmark TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  alternate_mobile_number TEXT,
  alternate_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.contact_details TO authenticated;
GRANT ALL ON public.contact_details TO service_role;
ALTER TABLE public.contact_details ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_contact_updated BEFORE UPDATE ON public.contact_details FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Contact self read" ON public.contact_details FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND (c.profile_id = auth.uid() OR public.is_staff(auth.uid()))));
CREATE POLICY "Contact self write" ON public.contact_details FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.profile_id = auth.uid()));
CREATE POLICY "Contact self update" ON public.contact_details FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND (c.profile_id = auth.uid() OR public.is_staff(auth.uid()))));

-- =========================================================
-- KYC
-- =========================================================
CREATE TABLE public.kyc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL UNIQUE REFERENCES public.customers(id) ON DELETE CASCADE,
  aadhaar_number TEXT,
  pan_number TEXT,
  document_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.kyc TO authenticated;
GRANT ALL ON public.kyc TO service_role;
ALTER TABLE public.kyc ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_kyc_updated BEFORE UPDATE ON public.kyc FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "KYC self read" ON public.kyc FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND (c.profile_id = auth.uid() OR public.is_staff(auth.uid()))));
CREATE POLICY "KYC self insert" ON public.kyc FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.profile_id = auth.uid()));
CREATE POLICY "KYC update self or staff" ON public.kyc FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND (c.profile_id = auth.uid() OR public.is_staff(auth.uid()))));

-- =========================================================
-- NOMINEES
-- =========================================================
CREATE TABLE public.nominees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL UNIQUE REFERENCES public.customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship public.relationship NOT NULL,
  date_of_birth DATE,
  mobile_number TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.nominees TO authenticated;
GRANT ALL ON public.nominees TO service_role;
ALTER TABLE public.nominees ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_nominees_updated BEFORE UPDATE ON public.nominees FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Nominee self read" ON public.nominees FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND (c.profile_id = auth.uid() OR public.is_staff(auth.uid()))));
CREATE POLICY "Nominee self write" ON public.nominees FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.profile_id = auth.uid()));
CREATE POLICY "Nominee self update" ON public.nominees FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.profile_id = auth.uid()));

-- =========================================================
-- BRANCHES
-- =========================================================
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ifsc TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  manager TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.branches TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.branches TO authenticated;
GRANT ALL ON public.branches TO service_role;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_branches_updated BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Branches readable" ON public.branches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Branches admin write" ON public.branches FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Branches admin update" ON public.branches FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Branches admin delete" ON public.branches FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- ACCOUNTS
-- =========================================================
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  account_number TEXT NOT NULL UNIQUE,
  account_type public.account_type NOT NULL,
  mode_of_operation public.mode_of_operation NOT NULL DEFAULT 'SINGLE',
  balance NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.accounts TO authenticated;
GRANT ALL ON public.accounts TO service_role;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_accounts_updated BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Accounts self read" ON public.accounts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND (c.profile_id = auth.uid() OR public.is_staff(auth.uid()))));
CREATE POLICY "Accounts self insert" ON public.accounts FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.profile_id = auth.uid()));
CREATE POLICY "Accounts staff update" ON public.accounts FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.profile_id = auth.uid()));

-- =========================================================
-- TRANSACTIONS
-- =========================================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  txn_type public.transaction_type NOT NULL,
  medium public.transaction_medium NOT NULL DEFAULT 'ONLINE',
  mode public.transaction_mode NOT NULL,
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  status public.transaction_status NOT NULL DEFAULT 'SUCCESS',
  reference TEXT,
  counterparty_account TEXT,
  description TEXT,
  balance_after NUMERIC(18,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_txn_account ON public.transactions(account_id, created_at DESC);

CREATE POLICY "Txn self read" ON public.transactions FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.accounts a JOIN public.customers c ON c.id = a.customer_id
    WHERE a.id = account_id AND (c.profile_id = auth.uid() OR public.is_staff(auth.uid()))
  ));
-- writes only via SECURITY DEFINER RPCs below

-- =========================================================
-- ATOMIC MONEY OPERATIONS
-- =========================================================
CREATE OR REPLACE FUNCTION public.fn_deposit(_account_id UUID, _amount NUMERIC, _medium public.transaction_medium, _description TEXT)
RETURNS public.transactions LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _new_balance NUMERIC; _txn public.transactions; _owner UUID;
BEGIN
  IF _amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;
  SELECT c.profile_id INTO _owner FROM public.accounts a JOIN public.customers c ON c.id=a.customer_id WHERE a.id=_account_id;
  IF _owner IS NULL THEN RAISE EXCEPTION 'Account not found'; END IF;
  IF _owner <> auth.uid() AND NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'Forbidden'; END IF;

  UPDATE public.accounts SET balance = balance + _amount WHERE id = _account_id RETURNING balance INTO _new_balance;
  INSERT INTO public.transactions(account_id, txn_type, medium, mode, amount, status, description, balance_after)
  VALUES (_account_id,'DEPOSIT', _medium, 'CREDIT', _amount, 'SUCCESS', _description, _new_balance)
  RETURNING * INTO _txn;
  RETURN _txn;
END; $$;

CREATE OR REPLACE FUNCTION public.fn_withdraw(_account_id UUID, _amount NUMERIC, _medium public.transaction_medium, _description TEXT)
RETURNS public.transactions LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _new_balance NUMERIC; _txn public.transactions; _owner UUID; _bal NUMERIC;
BEGIN
  IF _amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;
  SELECT c.profile_id, a.balance INTO _owner, _bal FROM public.accounts a JOIN public.customers c ON c.id=a.customer_id WHERE a.id=_account_id FOR UPDATE;
  IF _owner IS NULL THEN RAISE EXCEPTION 'Account not found'; END IF;
  IF _owner <> auth.uid() AND NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF _bal < _amount THEN RAISE EXCEPTION 'Insufficient balance'; END IF;

  UPDATE public.accounts SET balance = balance - _amount WHERE id = _account_id RETURNING balance INTO _new_balance;
  INSERT INTO public.transactions(account_id, txn_type, medium, mode, amount, status, description, balance_after)
  VALUES (_account_id,'WITHDRAWAL', _medium, 'DEBIT', _amount, 'SUCCESS', _description, _new_balance)
  RETURNING * INTO _txn;
  RETURN _txn;
END; $$;

CREATE OR REPLACE FUNCTION public.fn_transfer(_source_account_id UUID, _dest_account_number TEXT, _amount NUMERIC, _medium public.transaction_medium, _description TEXT)
RETURNS public.transactions LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _src_owner UUID; _src_bal NUMERIC; _src_new NUMERIC;
  _dst_id UUID; _dst_new NUMERIC; _src_acct_no TEXT;
  _debit_txn public.transactions; _ref TEXT;
BEGIN
  IF _amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;
  SELECT c.profile_id, a.balance, a.account_number INTO _src_owner, _src_bal, _src_acct_no
    FROM public.accounts a JOIN public.customers c ON c.id=a.customer_id WHERE a.id=_source_account_id FOR UPDATE;
  IF _src_owner IS NULL THEN RAISE EXCEPTION 'Source account not found'; END IF;
  IF _src_owner <> auth.uid() AND NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF _src_bal < _amount THEN RAISE EXCEPTION 'Insufficient balance'; END IF;

  SELECT id INTO _dst_id FROM public.accounts WHERE account_number = _dest_account_number FOR UPDATE;
  IF _dst_id IS NULL THEN RAISE EXCEPTION 'Destination account not found'; END IF;
  IF _dst_id = _source_account_id THEN RAISE EXCEPTION 'Cannot transfer to the same account'; END IF;

  _ref := 'TRF-' || to_char(now(),'YYYYMMDDHH24MISS') || '-' || substr(gen_random_uuid()::text,1,8);

  UPDATE public.accounts SET balance = balance - _amount WHERE id = _source_account_id RETURNING balance INTO _src_new;
  UPDATE public.accounts SET balance = balance + _amount WHERE id = _dst_id RETURNING balance INTO _dst_new;

  INSERT INTO public.transactions(account_id, txn_type, medium, mode, amount, status, reference, counterparty_account, description, balance_after)
  VALUES (_source_account_id,'TRANSFER',_medium,'DEBIT',_amount,'SUCCESS',_ref,_dest_account_number,_description,_src_new)
  RETURNING * INTO _debit_txn;

  INSERT INTO public.transactions(account_id, txn_type, medium, mode, amount, status, reference, counterparty_account, description, balance_after)
  VALUES (_dst_id,'TRANSFER',_medium,'CREDIT',_amount,'SUCCESS',_ref,_src_acct_no,_description,_dst_new);

  RETURN _debit_txn;
END; $$;

-- =========================================================
-- OTPS
-- =========================================================
CREATE TABLE public.otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  identifier TEXT NOT NULL,
  purpose public.otp_purpose NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.otps TO authenticated;
GRANT ALL ON public.otps TO service_role;
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_otp_user_purpose ON public.otps(user_id, purpose, created_at DESC);
CREATE POLICY "OTP self read" ON public.otps FOR SELECT TO authenticated USING (user_id = auth.uid());
