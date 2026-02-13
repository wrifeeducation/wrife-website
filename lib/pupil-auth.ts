import { getPool } from '@/lib/db';

export async function validatePupilSession(pupilId: string): Promise<{ valid: boolean; firstName?: string; yearGroup?: string }> {
  const pool = getPool();
  const result = await pool.query(
    `SELECT ps.pupil_id, p.first_name, p.year_group
     FROM pupil_sessions ps
     JOIN pupils p ON ps.pupil_id = p.id
     WHERE ps.pupil_id = $1 AND ps.expires_at > NOW()
     LIMIT 1`,
    [pupilId]
  );

  if (result.rows.length === 0) {
    return { valid: false };
  }

  return {
    valid: true,
    firstName: result.rows[0].first_name,
    yearGroup: result.rows[0].year_group,
  };
}
