import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.PROD_DATABASE_URL || process.env.DATABASE_URL,
});

export type ActivityEventType =
  | 'login'
  | 'logout'
  | 'lesson_view'
  | 'lesson_download'
  | 'pwp_start'
  | 'pwp_complete'
  | 'dwp_start'
  | 'dwp_complete'
  | 'assignment_create'
  | 'assignment_submit'
  | 'class_create'
  | 'pupil_add'
  | 'page_view';

interface ActivityEvent {
  userId?: string | null;
  userRole?: string | null;
  eventType: ActivityEventType;
  eventData?: Record<string, unknown>;
  pagePath?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function trackActivity(event: ActivityEvent): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO user_activity (user_id, user_role, event_type, event_data, page_path, session_id, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        event.userId || null,
        event.userRole || null,
        event.eventType,
        JSON.stringify(event.eventData || {}),
        event.pagePath || null,
        event.sessionId || null,
        event.ipAddress || null,
        event.userAgent || null,
      ]
    );
  } catch (error) {
    console.error('Failed to track activity:', error);
  }
}

export function trackActivityAsync(event: ActivityEvent): void {
  trackActivity(event).catch((err) => {
    console.error('Async activity tracking failed:', err);
  });
}

export function extractRequestInfo(request: Request): {
  ipAddress?: string;
  userAgent?: string;
} {
  const headers = request.headers;
  return {
    ipAddress: headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               headers.get('x-real-ip') || 
               undefined,
    userAgent: headers.get('user-agent') || undefined,
  };
}
