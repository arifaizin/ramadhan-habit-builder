-- Create a function to get leaderboard data with optional community filtering
-- This function calculates total scores from check-ins, quizzes, and streak bonuses
-- Names are masked as 'Hamba Allah' for other users for privacy

CREATE OR REPLACE FUNCTION get_leaderboard(community_code_param text DEFAULT NULL)
RETURNS TABLE (
  rank bigint,
  user_id uuid,
  display_name text,
  total_score bigint,
  is_me boolean
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH user_scores AS (
    SELECT
      p.id as profile_id,
      p.name as profile_name,
      p.community_code as profile_community,
      (
        -- Daily check-in scores
        COALESCE((SELECT SUM(dc.daily_score) FROM public.daily_checkins dc WHERE dc.user_id = p.id), 0) +
        -- Quiz scores
        COALESCE((SELECT SUM(qa.quiz_score) FROM public.quiz_answers qa WHERE qa.user_id = p.id), 0) +
        -- Streak bonuses
        COALESCE((
          SELECT SUM(
            CASE
              WHEN b = 3 THEN 50
              WHEN b = 7 THEN 150
              WHEN b = 14 THEN 400
              WHEN b = 21 THEN 700
              ELSE 0
            END
          )
          FROM public.streaks s, unnest(s.earned_bonuses) as b
          WHERE s.user_id = p.id
        ), 0)
      ) as calculated_score
    FROM public.profiles p
    WHERE (community_code_param IS NULL OR p.community_code = community_code_param)
  )
  SELECT
    DENSE_RANK() OVER (ORDER BY us.calculated_score DESC)::bigint,
    us.profile_id,
    CASE 
      WHEN us.profile_id = auth.uid() THEN us.profile_name 
      ELSE 'Hamba Allah' 
    END,
    us.calculated_score::bigint,
    (us.profile_id = auth.uid())
  FROM user_scores us
  ORDER BY us.calculated_score DESC, us.profile_name ASC
  LIMIT 100;
END;
$$;
