-- Fix category icons: replace Lucide icon name strings with emoji
-- Affects all existing users seeded before this migration.
-- Safe: data-only UPDATE, no schema changes, no RLS changes.

UPDATE expense_categories SET icon = '🍴' WHERE icon = 'fork-knife';
UPDATE expense_categories SET icon = '🚗' WHERE icon = 'car';
UPDATE expense_categories SET icon = '🏨' WHERE icon = 'bed';
UPDATE expense_categories SET icon = '✈️' WHERE icon = 'plane';
UPDATE expense_categories SET icon = '🅿️' WHERE icon = 'parking';
UPDATE expense_categories SET icon = '⛽' WHERE icon = 'fuel';
UPDATE expense_categories SET icon = '💻' WHERE icon = 'laptop';
UPDATE expense_categories SET icon = '📎' WHERE icon = 'paperclip';
UPDATE expense_categories SET icon = '📅' WHERE icon = 'calendar';
UPDATE expense_categories SET icon = '⭐' WHERE icon = 'star';
UPDATE expense_categories SET icon = '📱' WHERE icon = 'phone';
UPDATE expense_categories SET icon = '📦' WHERE icon = 'more-horizontal';
