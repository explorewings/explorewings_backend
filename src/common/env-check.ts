/**
 * Fails fast, at boot, with one readable message when required configuration is
 * missing. Without this, a missing variable surfaces as a constructor stack
 * trace from deep inside Nest's injector, and on a PaaS the process exits before
 * binding a port, so the only symptom the operator sees is a proxy-level
 * "connection refused" with no hint about the real cause.
 */

const REQUIRED = [
  'DATABASE_URL',
  'AWS_ENDPOINT_URL_S3',
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
] as const;

const OPTIONAL: ReadonlyArray<{ name: string; fallback: string }> = [
  { name: 'S3_BUCKET', fallback: 'assets' },
  { name: 'DB_POOL_MAX', fallback: '10' },
  { name: 'PORT', fallback: '3000' },
];

export function assertEnv(): void {
  const missing = REQUIRED.filter((name) => {
    const value = process.env[name];
    return value === undefined || value.trim() === '';
  });

  if (missing.length === 0) return;

  const lines = [
    '',
    '  Cannot start: missing required environment variables.',
    '',
    ...missing.map((name) => `    - ${name}`),
    '',
    '  Locally these live in nestbackend/.env (gitignored, so it is never',
    '  deployed). On a PaaS, set them in the service configuration:',
    '',
    ...REQUIRED.map((name) => `    ${name}=...`),
    '',
    '  Do not set PORT on a PaaS; the platform injects it.',
    '',
  ];

  console.error(lines.join('\n'));
  process.exit(1);
}

/** Non-fatal configuration summary, printed once at boot. */
export function logConfigSummary(): void {
  const shown = OPTIONAL.map(({ name, fallback }) => {
    const value = process.env[name];
    return `${name}=${value && value.trim() !== '' ? value : `${fallback} (default)`}`;
  });
  console.log(`[explore-wings-api] config: ${shown.join(', ')}`);
}
