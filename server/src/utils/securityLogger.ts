const isProd = process.env.NODE_ENV === 'production';

type SecurityEvent =
  | 'login_failed'
  | 'login_success'
  | 'invalid_token'
  | 'expired_token'
  | 'rate_limit_hit'
  | 'brute_force_attempt'
  | 'note_locked';

interface SecurityLogEntry {
  event:      SecurityEvent;
  ip?:        string;
  userId?:    number;
  noteId?:    number;
  attempts?:  number;
  detail?:    string;
}

export const logSecurityEvent = (entry: SecurityLogEntry) => {
  const log = {
    timestamp: new Date().toISOString(),
    level:     'security',
    ...entry,
  };
  console.warn(JSON.stringify(log));
};
