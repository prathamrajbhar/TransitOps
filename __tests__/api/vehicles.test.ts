/**
 * __tests__/api/vehicles.test.ts
 * Comprehensive vehicle endpoint tests
 */
import { prisma } from '@/src/lib/prisma';

describe('Vehicles API', () => {
  let authToken: string;
  let userId: string;
  let organizationId: string;
  let vehicleId: string;

  beforeAll(async () => {
    // Setup: Create test user and get auth token
    const signupRes = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Vehicle Test User',
        email: `vehicle-test-${Date.now()}@example.com`,
        password: 'VehicleTest123!@',
        organizationId: 'test-org-vehicle',
        role: 'MANAGER',
      }),
    });
    const signupData = await signupRes.json();
    userId = signupData.data.userId;
    organizationId = signupData.data.organizationId;

    // Login to get session
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `vehicle-test-${Date.now() - 1000}@example.com`,
        password: 'VehicleTest123!@',
      }),
    });
    const loginData = await loginRes.json();
    authToken = loginData.data.userId;
  });

  describe('POST /api/vehicles', () => {
    it('should create a vehicle', async () => {
      const res = await fetch('http://localhost:3000/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plateNumber: 'DL01AB1234',
          make: 'Tata',
          model: 'Nexon',
          year: 2023,
          type: 'SUV',
          status: 'ACTIVE',
        }),
      });
      const data = await res.json();
      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.id).toBeDefined();
      vehicleId = data.data.id;
    });

    it('should reject duplicate plate number', async () => {
      const res = await fetch('http://localhost:3000/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plateNumber: 'DL01AB1234',
          make: 'Maruti',
          model: 'Swift',
          year: 2023,
          type: 'HATCHBACK',
          status: 'ACTIVE',
        }),
      });
      const data = await res.json();
      expect(res.status).toBe(409);
      expect(data.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const res = await fetch('http://localhost:3000/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: 'Tata',
          year: 2023,
        }),
      });
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/vehicles', () => {
    it('should list vehicles with pagination', async () => {
      const res = await fetch('http://localhost:3000/api/vehicles?page=1&limit=10');
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(10);
      expect(data.meta.total).toBeGreaterThanOrEqual(0);
      expect(data.meta.hasNext).toBeDefined();
      expect(data.meta.hasPrev).toBeDefined();
    });

    it('should handle invalid pagination params', async () => {
      const res = await fetch('http://localhost:3000/api/vehicles?page=0&limit=200');
      const data = await res.json();
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/vehicles/[id]', () => {
    it('should get vehicle by id', async () => {
      const res = await fetch(`http://localhost:3000/api/vehicles/${vehicleId}`);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(vehicleId);
      expect(data.data.plateNumber).toBe('DL01AB1234');
    });

    it('should return 404 for non-existent vehicle', async () => {
      const res = await fetch('http://localhost:3000/api/vehicles/invalid-id');
      const data = await res.json();
      expect(res.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('PATCH /api/vehicles/[id]', () => {
    it('should update vehicle', async () => {
      const res = await fetch(`http://localhost:3000/api/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'IN_MAINTENANCE',
        }),
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('IN_MAINTENANCE');
    });
  });

  describe('DELETE /api/vehicles/[id]', () => {
    it('should soft-delete vehicle', async () => {
      const res = await fetch(`http://localhost:3000/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
