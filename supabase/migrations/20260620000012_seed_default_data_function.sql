-- Seeds default categories and payment methods for a new user
-- Called by handle_new_user trigger after profile creation

CREATE OR REPLACE FUNCTION seed_user_defaults(p_user_id uuid)
RETURNS void AS $$
BEGIN
  -- Default expense categories
  INSERT INTO expense_categories (user_id, name, icon, color, is_default, sort_order) VALUES
    (p_user_id, 'Meals & Dining',         'fork-knife',       '#F59E0B', true,  1),
    (p_user_id, 'Transportation',         'car',              '#3B82F6', true,  2),
    (p_user_id, 'Accommodation',          'bed',              '#8B5CF6', true,  3),
    (p_user_id, 'Flights',                'plane',            '#06B6D4', true,  4),
    (p_user_id, 'Parking',                'parking',          '#64748B', true,  5),
    (p_user_id, 'Fuel',                   'fuel',             '#EF4444', true,  6),
    (p_user_id, 'Equipment',              'laptop',           '#10B981', true,  7),
    (p_user_id, 'Office Supplies',        'paperclip',        '#6366F1', true,  8),
    (p_user_id, 'Conference & Events',    'calendar',         '#EC4899', true,  9),
    (p_user_id, 'Client Entertainment',   'star',             '#F97316', true, 10),
    (p_user_id, 'Telecommunications',     'phone',            '#14B8A6', true, 11),
    (p_user_id, 'Other',                  'more-horizontal',  '#94A3B8', true, 12)
  ON CONFLICT (user_id, name) DO NOTHING;

  -- Default payment methods
  INSERT INTO payment_methods (user_id, name, type, is_default) VALUES
    (p_user_id, 'Cash',        'cash',        false),
    (p_user_id, 'Credit Card', 'credit_card', true),
    (p_user_id, 'Other',       'other',       false)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update handle_new_user to also call seed_user_defaults
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  PERFORM seed_user_defaults(NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
