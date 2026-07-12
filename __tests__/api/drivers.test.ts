/**
 * __tests__/api/drivers.test.ts
 * Comprehensive driver endpoint tests
 */
describe('Drivers API', () => {
  let driverId: string;

  describe('POST /api/drivers', () => {
    it('should create a driver', async () => {
      const res = await fetch('http://localhost:3000/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Raj Kumar',
          email: 'raj@example.com',
          phone: '9876543210',
          licenseNumber: 'DL0920210001234',
          status: 'ACTIVE',
        }),
      });
      const data = await res.json();
      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      driverId = data.data.id;
    });

    it('should reject duplicate license number', async () => {
      const res = await fetch('http://localhost:3000/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Priya Singh',
          email: 'priya@example.com',
          licenseNumber: 'DL0920210001234',
          status: 'ACTIVE',
        }),
      });
      const data = await res.json();
      expect(res.status).toBe(409);
    });

    it('should validate required fields', async () => {
      const res = await fetch('http://localhost:3000/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John' }),
      });
      const data = await res.json();
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/drivers', () => {
    it('should list drivers with pagination', async () => {
      const res = await fetch('http://localhost:3000/api/drivers?page=1&limit=10');
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.meta.page).toBe(1);
    });
  });

  describe('GET /api/drivers/[id]', () => {
    it('should get driver by id', async () => {
      const res = await fetch(`http://localhost:3000/api/drivers/${driverId}`);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.data.id).toBe(driverId);
    });
  });

  describe('PATCH /api/drivers/[id]', () => {
    it('should update driver', async () => {
      const res = await fetch(`http://localhost:3000/api/drivers/${driverId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ON_LEAVE' }),
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.data.status).toBe('ON_LEAVE');
    });
  });

  describe('GET /api/drivers/[id]/stats', () => {
    it('should return driver stats', async () => {
      const res = await fetch(`http://localhost:3000/api/drivers/${driverId}/stats`);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.data).toHaveProperty('tripsCount');
      expect(data.data).toHaveProperty('completedTrips');
      expect(data.data).toHaveProperty('completionRate');
    });
  });

  describe('DELETE /api/drivers/[id]', () => {
    it('should soft-delete driver', async () => {
      const res = await fetch(`http://localhost:3000/api/drivers/${driverId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      expect(res.status).toBe(200);
    });
  });
});
