-- 매칭 실행을 주기적으로 호출하려면 아래를 사용하세요.
-- Supabase 대시보드 → SQL Editor에서 실행 전에:
-- 1. Database → Extensions 에서 pg_cron, pg_net 활성화
-- 2. YOUR_PROJECT_REF, YOUR_ANON_OR_SERVICE_KEY 를 실제 값으로 교체

-- 예: 1분마다 run-match Edge Function 호출
/*
SELECT cron.schedule(
  'run-match-every-minute',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/run-match',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_OR_SERVICE_KEY'
    ),
    body := '{}'
  );
  $$
);
*/

-- 스케줄 확인: SELECT * FROM cron.job;
-- 삭제: SELECT cron.unschedule('run-match-every-minute');
