
CREATE OR REPLACE FUNCTION public.fn_open_account(
  p_branch_id UUID,
  p_account_type public.account_type,
  p_initial_deposit NUMERIC DEFAULT 0
) RETURNS public.accounts
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _cust_id UUID;
  _branch_ifsc TEXT;
  _acct_no TEXT;
  _acct public.accounts;
BEGIN
  IF p_initial_deposit < 0 THEN RAISE EXCEPTION 'Initial deposit cannot be negative'; END IF;

  SELECT id INTO _cust_id FROM public.customers WHERE profile_id = auth.uid();
  IF _cust_id IS NULL THEN
    RAISE EXCEPTION 'Please complete your customer profile before opening an account';
  END IF;

  SELECT ifsc INTO _branch_ifsc FROM public.branches WHERE id = p_branch_id;
  IF _branch_ifsc IS NULL THEN RAISE EXCEPTION 'Branch not found'; END IF;

  LOOP
    _acct_no := lpad((floor(random() * 1000000000000))::bigint::text, 12, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.accounts WHERE account_number = _acct_no);
  END LOOP;

  INSERT INTO public.accounts(customer_id, branch_id, account_number, account_type, balance)
  VALUES (_cust_id, p_branch_id, _acct_no, p_account_type, p_initial_deposit)
  RETURNING * INTO _acct;

  IF p_initial_deposit > 0 THEN
    INSERT INTO public.transactions(account_id, txn_type, medium, mode, amount, status, description, balance_after)
    VALUES (_acct.id, 'DEPOSIT', 'CASH', 'CREDIT', p_initial_deposit, 'SUCCESS', 'Account opening deposit', p_initial_deposit);
  END IF;

  RETURN _acct;
END; $$;

REVOKE ALL ON FUNCTION public.fn_open_account(UUID, public.account_type, NUMERIC) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_open_account(UUID, public.account_type, NUMERIC) TO authenticated;

INSERT INTO public.branches(name, ifsc, address, city, state, manager)
SELECT * FROM (VALUES
  ('Mumbai Main',   'NEPB0000001', '1 Marine Drive',     'Mumbai',    'Maharashtra', 'Aarav Shah'),
  ('Bengaluru MG',  'NEPB0000002', '12 MG Road',          'Bengaluru', 'Karnataka',   'Riya Iyer'),
  ('Delhi CP',      'NEPB0000003', '5 Connaught Place',   'New Delhi', 'Delhi',       'Karan Mehta'),
  ('Chennai T Nag', 'NEPB0000004', '88 T Nagar',          'Chennai',   'Tamil Nadu',  'Priya Raman')
) AS v(name, ifsc, address, city, state, manager)
WHERE NOT EXISTS (SELECT 1 FROM public.branches);
