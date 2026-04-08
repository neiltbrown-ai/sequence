CREATE TABLE IF NOT EXISTS public.admin_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  label text,
  description text,
  category text DEFAULT 'general',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Seed default AI cost settings aligned to Claude Console categories
INSERT INTO admin_settings (key, value, label, description, category) VALUES
  ('ai_cost_per_message', '"0.033"', 'Cost per Chat Message', 'Average cost per AI assistant response in chat (input tokens from system prompt + conversation history + output tokens)', 'ai_costs'),
  ('ai_cost_per_roadmap', '"0.12"', 'Cost per Strategic Roadmap', 'Cost per roadmap generation from assessment completion', 'ai_costs'),
  ('ai_cost_per_verdict', '"0.11"', 'Cost per Deal Verdict', 'Cost per deal evaluation verdict generation', 'ai_costs'),
  ('ai_cost_per_analysis', '"0.09"', 'Cost per Asset Analysis', 'Cost per asset inventory portfolio analysis', 'ai_costs'),
  ('ai_regen_multiplier', '"1.2"', 'Regeneration Multiplier', 'Multiplier applied to roadmap costs to account for regeneration calls (1.0 = no regenerations)', 'ai_costs'),
  ('ai_model_primary', '"claude-sonnet-4-20250514"', 'Primary Model', 'Main model used for chat and generations', 'ai_config'),
  ('ai_model_input_cost', '"3.00"', 'Input Token Cost (per 1M)', 'Cost per million input tokens for the primary model', 'ai_costs'),
  ('ai_model_output_cost', '"15.00"', 'Output Token Cost (per 1M)', 'Cost per million output tokens for the primary model', 'ai_costs')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin only" ON admin_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
