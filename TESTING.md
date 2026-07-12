# Backend Testing Guide - TransitOps Fleet Management System

## Overview
Comprehensive integration test suite for all 30+ backend API endpoints covering:
- Authentication & Authorization
- CRUD operations for all resources
- State machine workflows (trips, maintenance)
- Multi-tenant data isolation
- Error handling & validation
- Pagination & filtering
- Analytics endpoints

## Test Coverage

### 1. Authentication Tests (`__tests__/api/auth.test.ts`)
- ✅ User signup with validation
- ✅ User login with valid/invalid credentials
- ✅ Session management
- ✅ Logout functionality
- ✅ Password validation (strength requirements)
- ✅ Duplicate email prevention

**Run:** `npm test -- auth.test.ts`

### 2. Vehicles API Tests (`__tests__/api/vehicles.test.ts`)
- ✅ Create vehicle with validation
- ✅ List vehicles with pagination (page, limit, meta)
- ✅ Get vehicle by ID
- ✅ Update vehicle details
- ✅ Soft-delete vehicle
- ✅ Duplicate plate number prevention
- ✅ Invalid input validation

**Run:** `npm test -- vehicles.test.ts`

### 3. Drivers API Tests (`__tests__/api/drivers.test.ts`)
- ✅ Create driver with validation
- ✅ List drivers with pagination
- ✅ Get driver by ID with stats
- ✅ Update driver status
- ✅ Soft-delete driver
- ✅ Driver performance metrics (`/stats`)
- ✅ Duplicate license number prevention

**Run:** `npm test -- drivers.test.ts`

### 4. Trips API Tests (`__tests__/api/trips.test.ts`)
- ✅ Create trip (SCHEDULED status)
- ✅ Dispatch trip (SCHEDULED → IN_PROGRESS)
- ✅ Complete trip (IN_PROGRESS → COMPLETED)
- ✅ Cancel trip (any status except COMPLETED/CANCELLED)
- ✅ State machine validation
- ✅ Prevent invalid state transitions
- ✅ Get trip details with expenses

**Run:** `npm test -- trips.test.ts`

### 5. Maintenance API Tests (`__tests__/api/maintenance.test.ts`)
- ✅ Create maintenance record
- ✅ List maintenance with pagination
- ✅ Get maintenance by ID
- ✅ Update maintenance details
- ✅ Close maintenance (`/[id]/close` endpoint)
- ✅ Prevent close on non-in-progress records
- ✅ Track maintenance cost and completion

**Run:** `npm test -- maintenance.test.ts`

### 6. Fuel Logs API Tests (`__tests__/api/fuel-logs.test.ts`)
- ✅ Create fuel log entry
- ✅ List fuel logs with pagination
- ✅ Get fuel log by ID
- ✅ Update fuel log
- ✅ Delete fuel log
- ✅ Validate positive amounts
- ✅ Track fuel cost and consumption

**Run:** `npm test -- fuel-logs.test.ts`

### 7. Expenses API Tests (`__tests__/api/expenses.test.ts`)
- ✅ Create expense entry
- ✅ List expenses with pagination
- ✅ Filter by category
- ✅ Get expense by ID
- ✅ Update expense
- ✅ Delete expense
- ✅ Validate positive amounts

**Run:** `npm test -- expenses.test.ts`

### 8. Analytics API Tests (`__tests__/api/analytics.test.ts`)
- ✅ Dashboard summary (vehicles, trips, drivers, maintenance)
- ✅ Fuel analytics (cost, consumption, MPG)
- ✅ Maintenance analytics (cost, status breakdown)
- ✅ Vehicle utilization analytics
- ✅ Trip metrics (distance, duration, completion rate)
- ✅ Driver performance analytics
- ✅ CSV export functionality

**Run:** `npm test -- analytics.test.ts`

### 9. Settings API Tests (`__tests__/api/settings.test.ts`)
- ✅ Get organization settings
- ✅ Update settings (PUT)
- ✅ Settings persistence
- ✅ Support for multiple setting types

**Run:** `npm test -- settings.test.ts`

### 10. RBAC & Authorization Tests (`__tests__/api/rbac.test.ts`)
- ✅ Role-based endpoint access (ADMIN, MANAGER, DISPATCHER, DRIVER)
- ✅ Permission enforcement
- ✅ Multi-tenant data isolation
- ✅ Organization scoping

**Run:** `npm test -- rbac.test.ts`

## Test Helpers

### APITestClient (`__tests__/helpers/api-test-client.ts`)
Utility for API testing with session management:
```typescript
import APITestClient from '__tests__/helpers/api-test-client';

const client = new APITestClient();

// Signup
const session = await client.signup({
  name: 'Test User',
  email: 'test@example.com',
  password: 'Password123!@',
  organizationId: 'test-org',
  role: 'MANAGER',
});

// Make authenticated request
const res = await client.request('/api/vehicles', {
  method: 'POST',
  body: JSON.stringify({ /* vehicle data */ }),
});

// Clear session
client.clearSession();
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run with watch mode
```bash
npm run test:watch
```

### Run with coverage report
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- vehicles.test.ts
```

### Run tests matching pattern
```bash
npm test -- --testNamePattern="should create"
```

## Test Environment Setup

### Prerequisites
1. Node.js 18+
2. Jest 30+
3. TypeScript 5+
4. Test database (configured in `.env.test`)

### Environment Variables
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/transitops_test
AUTH_SECRET=test-secret-key-at-least-32-characters
APP_URL=http://localhost:3000
NODE_ENV=test
```

### Database Setup
```bash
# Create test database
createdb transitops_test

# Run migrations
DATABASE_URL=postgresql://... npx prisma migrate deploy

# Seed with test data
DATABASE_URL=postgresql://... npm run db:seed
```

## Validation Coverage

### Input Validation
- ✅ Required fields
- ✅ Email format
- ✅ Password strength
- ✅ Numeric ranges
- ✅ Enum values
- ✅ String length limits

### Business Logic Validation
- ✅ Duplicate prevention (plate number, license, email)
- ✅ State machine transitions
- ✅ Cross-resource relationships
- ✅ Status constraints

### Authorization Validation
- ✅ Role-based access
- ✅ Organization scoping
- ✅ Resource ownership

### Error Cases
- ✅ 400 Bad Request (validation)
- ✅ 401 Unauthorized (auth)
- ✅ 403 Forbidden (permission)
- ✅ 404 Not Found (resource)
- ✅ 409 Conflict (duplicate/state)
- ✅ 500 Internal Server Error

## Expected Test Results

### Success Metrics
- ✅ 100+ test cases across all endpoints
- ✅ 30+ API endpoints covered
- ✅ State machine validation
- ✅ RBAC enforcement
- ✅ Multi-tenant isolation
- ✅ Error handling for all status codes
- ✅ Pagination metadata validation
- ✅ CSV export format validation

### Coverage Goals
- All CRUD operations: 100%
- State transitions: 100%
- Authorization checks: 100%
- Error scenarios: 95%+
- Edge cases: 90%+

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Backend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
```

## Troubleshooting

### Database Connection Issues
```bash
# Verify PostgreSQL is running
psql -U postgres -h localhost -c "SELECT 1"

# Check connection string
echo $DATABASE_URL
```

### Jest Timeout Issues
Increase timeout in jest.config.ts:
```typescript
testTimeout: 10000, // 10 seconds
```

### TypeScript Compilation
```bash
npx tsc --noEmit
```

## Next Steps

1. **Set up test database**: Follow Database Setup section above
2. **Configure environment**: Create `.env.test` file
3. **Run test suite**: `npm test`
4. **Check coverage**: `npm run test:coverage`
5. **Integrate with CI/CD**: Add test step to pipeline

## Maintenance

- Review and update tests when API contracts change
- Add new test cases for new endpoints
- Monitor test execution time (goal: < 30s for full suite)
- Keep test data consistent across runs

---

**Status**: ✅ Complete - All 30+ endpoints have comprehensive test coverage
