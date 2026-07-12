/**
 * __tests__/api/vehicles.test.ts
 * Comprehensive vehicle endpoint tests
 */
describe('Vehicles API', () => {
  let vehicleId: string;

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
      const _data = await res.json();
      expect(res.status).toBe(201);
      expect(_data.success).toBe(true);
      expect(_data.data.id).toBeDefined();
      vehicleId = _data.data.id;
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
      const _data = await res.json();
      expect(res.status).toBe(409);
      expect(_data.success).toBe(false);
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
      const _data = await res.json();
      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/vehicles', () => {
    it('should list vehicles with pagination', async () => {
      const res = await fetch('http://localhost:3000/api/vehicles?page=1&limit=10');
      const _data = await res.json();
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
      const _data = await res.json();
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/vehicles/[id]', () => {
    it('should get vehicle by id', async () => {
      const res = await fetch(`http://localhost:3000/api/vehicles/${vehicleId}`);
      const _data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(vehicleId);
      expect(data.data.plateNumber).toBe('DL01AB1234');
    });

    it('should return 404 for non-existent vehicle', async () => {
      const res = await fetch('http://localhost:3000/api/vehicles/invalid-id');
      const _data = await res.json();
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
      const _data = await res.json();
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
      const _data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
