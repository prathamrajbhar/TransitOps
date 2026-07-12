/**
 * __tests__/helpers/api-test-client.ts
 * API test client with authentication helper
 */
import fetch from 'node-fetch';

interface TestSession {
  userId: string;
  role: string;
  organizationId: string;
  email: string;
}

class APITestClient {
  private baseUrl: string;
  private session: TestSession | null = null;
  private cookies: string[] = [];

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async signup(userData: {
    name: string;
    email: string;
    password: string;
    organizationId: string;
    role: string;
  }): Promise<TestSession> {
    const res = await this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (res.status !== 201) throw new Error(`Signup failed: ${data.error}`);

    this.session = {
      userId: data.data.userId,
      role: data.data.role,
      organizationId: data.data.organizationId,
      email: userData.email,
    };
    return this.session;
  }

  async login(email: string, password: string): Promise<TestSession> {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Login failed: ${data.error}`);

    this.session = {
      userId: data.data.userId,
      role: data.data.role,
      organizationId: data.data.organizationId,
      email,
    };
    return this.session;
  }

  async request(path: string, options: any = {}): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.cookies.length) {
      headers['Cookie'] = this.cookies.join('; ');
    }

    const res = await fetch(url, { ...options, headers });

    // Extract and store cookies
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      this.cookies.push(setCookie.split(';')[0]);
    }

    return res;
  }

  getSession(): TestSession | null {
    return this.session;
  }

  clearSession(): void {
    this.session = null;
    this.cookies = [];
  }
}

export default APITestClient;
