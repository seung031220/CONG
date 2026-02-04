-- 매칭 룸: [왼쪽 1명, 오른쪽 1명, 본체 1명] 같은 모델끼리 한 팀
CREATE TABLE IF NOT EXISTS public.matching_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model TEXT NOT NULL CHECK (model IN (
    'airpods-1', 'airpods-2', 'airpods-3', 'airpods-4',
    'pro-1', 'pro-2', 'pro-3'
  )),
  left_registration_id UUID NOT NULL REFERENCES public.part_registrations(id) ON DELETE CASCADE,
  right_registration_id UUID NOT NULL REFERENCES public.part_registrations(id) ON DELETE CASCADE,
  case_registration_id UUID NOT NULL REFERENCES public.part_registrations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'playing', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_matching_rooms_model ON public.matching_rooms(model);
CREATE INDEX IF NOT EXISTS idx_matching_rooms_status ON public.matching_rooms(status);

-- part_registrations에 room_id 추가 (매칭 시 채움)
ALTER TABLE public.part_registrations
  ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES public.matching_rooms(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_part_registrations_room_id ON public.part_registrations(room_id);

-- 매칭 알고리즘: 같은 모델에서 [왼쪽 1명, 오른쪽 1명, 본체 1명]이 있으면 룸 생성
-- FOR UPDATE SKIP LOCKED 로 동시 실행 시 중복 매칭 방지
CREATE OR REPLACE FUNCTION public.try_match_rooms()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  m TEXT;
  models TEXT[] := ARRAY['airpods-1','airpods-2','airpods-3','airpods-4','pro-1','pro-2','pro-3'];
  left_id UUID;
  right_id UUID;
  case_id UUID;
  new_room_id UUID;
  matched INTEGER := 0;
BEGIN
  FOREACH m IN ARRAY models
  LOOP
    -- 각 부품 타입별로 대기 중인 1명씩 선택 후 행 잠금 (선착순)
    SELECT l.id, r.id, c.id INTO left_id, right_id, case_id
    FROM
      (SELECT id FROM part_registrations
       WHERE model = m AND part_type = 'left' AND status = 'waiting'
       ORDER BY created_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED) l,
      (SELECT id FROM part_registrations
       WHERE model = m AND part_type = 'right' AND status = 'waiting'
       ORDER BY created_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED) r,
      (SELECT id FROM part_registrations
       WHERE model = m AND part_type = 'case' AND status = 'waiting'
       ORDER BY created_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED) c;

    IF left_id IS NOT NULL AND right_id IS NOT NULL AND case_id IS NOT NULL THEN
      INSERT INTO public.matching_rooms (model, left_registration_id, right_registration_id, case_registration_id, status)
      VALUES (m, left_id, right_id, case_id, 'lobby')
      RETURNING id INTO new_room_id;

      UPDATE public.part_registrations
      SET status = 'matched', room_id = new_room_id
      WHERE id IN (left_id, right_id, case_id);

      matched := matched + 1;
    END IF;
  END LOOP;
  RETURN matched;
END;
$$;

-- RLS: 매칭 룸은 해당 룸의 참가자(3명)만 조회 가능
ALTER TABLE public.matching_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room participants can read room"
  ON public.matching_rooms FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.part_registrations
      WHERE id IN (left_registration_id, right_registration_id, case_registration_id)
    )
  );

-- anon은 매칭 룸 조회 불가
-- try_match_rooms는 SECURITY DEFINER로 서버/Edge Function에서 호출

-- Realtime: Supabase 대시보드 → Database → Replication 에서
-- part_registrations, matching_rooms 테이블을 활성화하세요.
