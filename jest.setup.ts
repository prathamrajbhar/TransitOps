// Jest setup file
((process.env as unknown) as Record<string, string>).NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/transitops_test';
process.env.AUTH_SECRET = 'test-secret-key-at-least-32-characters-long';
process.env.APP_URL = 'http://localhost:3000';
