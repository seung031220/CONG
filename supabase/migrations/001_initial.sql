-- 부품 등록 테이블 (매칭 대기열)
CREATE TABLE IF NOT EXISTS public.part_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model TEXT NOT NULL CHECK (model IN (
    'airpods-1', 'airpods-2', 'airpods-3', 'airpods-4',
    'pro-1', 'pro-2', 'pro-3'
  )),
  part_type TEXT NOT NULL CHECK (part_type IN ('left', 'right', 'case')),
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'matched', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스: 대기열 조회 및 부품별 카운트
CREATE INDEX IF NOT EXISTS idx_part_registrations_status_part ON public.part_registrations(status, part_type);
CREATE INDEX IF NOT EXISTS idx_part_registrations_user_id ON public.part_registrations(user_id);

-- RLS 활성화
ALTER TABLE public.part_registrations ENABLE ROW LEVEL SECURITY;

-- SELECT: 본인 행 또는 status = 'waiting'인 행(대시보드 카운트용) 조회 가능
CREATE POLICY "Read own or waiting registrations"
  ON public.part_registrations FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() = user_id
    OR status = 'waiting'
  );

-- INSERT: 인증된 사용자는 자신의 부품만 등록 (user_id = auth.uid())
CREATE POLICY "Users can insert own registrations"
  ON public.part_registrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Storage: part-photos 버킷 생성 (이미지 업로드용)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'part-photos',
  'part-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: 인증된 사용자만 자신의 폴더(user_id)에 업로드
CREATE POLICY "Users can upload own part photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'part-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Public read part photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'part-photos');
