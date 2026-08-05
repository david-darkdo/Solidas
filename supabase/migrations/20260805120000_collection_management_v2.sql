
-- 1. Extend collections table
ALTER TABLE public.collections 
  ADD COLUMN IF NOT EXISTS project_name TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Draft',
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS parent_collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

-- 2. Extend collection_items table
ALTER TABLE public.collection_items 
  ADD COLUMN IF NOT EXISTS quantity NUMERIC DEFAULT 1,
  ADD COLUMN IF NOT EXISTS unit TEXT,
  ADD COLUMN IF NOT EXISTS installation_location TEXT,
  ADD COLUMN IF NOT EXISTS delivery_preference TEXT DEFAULT 'Deliver to Site',
  ADD COLUMN IF NOT EXISTS installation_required TEXT DEFAULT 'Not Sure',
  ADD COLUMN IF NOT EXISTS project_notes TEXT;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_collections_user_status ON public.collections(user_id, status);
CREATE INDEX IF NOT EXISTS idx_collections_parent ON public.collections(parent_collection_id);
