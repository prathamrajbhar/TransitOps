/**
 * __tests__/api/auth.test.ts
 * Comprehensive authentication endpoint tests
 */
import { prisma } from '@/src/lib/prisma';

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Setup: Clean database
    await prisma.user.deleteMany({});
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user with valid credentials', async () => {
      const res = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password123!@',
          organizationId: 'test-org-id',
          role: 'DRIVER',
        }),
      });
      const data = await res.json();
      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.userId).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'dup@example.com',
          password: 'Password123!@',
          organizationId: 'test-org-id',
          role: 'DRIVER',
        }),
      });

      const res = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Jane Doe',
          email: 'dup@example.com',
          password: 'Password456!@',
          organizationId: 'test-org-id',
          role: 'DRIVER',
        }),
      });
      const data = await res.json();
      expect(res.status).toBe(409);
      expect(data.success).toBe(false);
    });

    it('should reject weak password', async () => {
      const res = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Jane Doe',
          email: 'weak@example.com',
          password: 'weak',
          organizationId: 'test-org-id',
          role: 'DRIVER',
        }),
      });
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject invalid email', async () => {
      const res = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Jane Doe',
          email: 'invalid-email',
          password: 'Password123!@',
          organizationId: 'test-org-id',
          role: 'DRIVER',
        }),
      });
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      // Create test user
      await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'TestPass123!@',
          organizationId: 'test-org-id',
          role: 'DRIVER',
        }),
      });
    });

    it('should login with valid credentials', async () => {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPass123!@',
        }),
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.userId).toBeDefined();
      expect(data.data.role).toBe('DRIVER');
    });

    it('should reject invalid password', async () => {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'WrongPassword123!@',
        }),
      });
      const data = await res.json();
      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should reject non-existent user', async () => {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'Password123!@',
        }),
      });
      const data = await res.json();
      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/auth/session', () => {
    it('should return null for unauthenticated request', async () => {
      const res = await fetch('http://localhost:3000/api/auth/session');
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.data).toBeNull();
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear session', async () => {
      const res = await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
