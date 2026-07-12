/**
 * __tests__/api/expenses.test.ts
 * Comprehensive expenses endpoint tests
 */
describe('Expenses API', () => {
  let expenseId: string;

  describe('POST /api/expenses', () => {
    it('should create expense', async () => {
      const res = await fetch('http://localhost:3000/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'FUEL',
          amount: 5000,
          description: 'Fuel for Delhi-Mumbai trip',
          date: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      expect(res.status).toBe(201);
      expenseId = data.data.id;
    });

    it('should validate positive amount', async () => {
      const res = await fetch('http://localhost:3000/api/expenses', {
        method: 'POST',
        body: JSON.stringify({
          category: 'FUEL',
          amount: -100,
          description: 'Invalid expense',
        }),
      });
      const data = await res.json();
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/expenses', () => {
    it('should list expenses with pagination', async () => {
      const res = await fetch('http://localhost:3000/api/expenses?page=1&limit=10');
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should filter by category', async () => {
      const res = await fetch('http://localhost:3000/api/expenses?category=FUEL');
      const data = await res.json();
      expect(res.status).toBe(200);
      data.data.forEach((expense: any) => {
        expect(expense.category).toBe('FUEL');
      });
    });
  });

  describe('GET /api/expenses/[id]', () => {
    it('should get expense by id', async () => {
      const res = await fetch(`http://localhost:3000/api/expenses/${expenseId}`);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.data.id).toBe(expenseId);
    });
  });

  describe('PATCH /api/expenses/[id]', () => {
    it('should update expense', async () => {
      const res = await fetch(`http://localhost:3000/api/expenses/${expenseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 5500 }),
      });
      const data = await res.json();
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/expenses/[id]', () => {
    it('should delete expense', async () => {
      const res = await fetch(`http://localhost:3000/api/expenses/${expenseId}`, {
        method: 'DELETE',
      });
      expect(res.status).toBe(200);
    });
  });
});
