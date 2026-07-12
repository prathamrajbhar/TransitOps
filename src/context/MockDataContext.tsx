"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// --- ENUMS & TYPES ---

export type RoleName = "FLEET_MANAGER" | "DISPATCHER" | "SAFETY_OFFICER" | "FINANCIAL_ANALYST";

export type VehicleType = "VAN" | "TRUCK" | "MINI" | "BUS" | "OTHER";
export type VehicleStatus = "AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED";

export type LicenseCategory = "LMV" | "HMV" | "OTHER";
export type DriverStatus = "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "SUSPENDED";

export type TripStatus = "DRAFT" | "DISPATCHED" | "COMPLETED" | "CANCELLED";
export type MaintenanceStatus = "ACTIVE" | "COMPLETED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  failedLogins: number;
  lockedUntil: string | null;
  isActive: boolean;
}

export interface Vehicle {
  id: string;
  registrationNo: string;
  nameModel: string;
  type: VehicleType;
  maxLoadCapacityKg: number;
  odometerKm: number;
  acquisitionCost: number;
  region: string;
  status: VehicleStatus;
  createdAt: string;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  licenseNo: string;
  licenseCategory: LicenseCategory;
  licenseExpiry: string;
  contactNumber: string;
  safetyScore: number;
  status: DriverStatus;
  createdAt: string;
}

export interface Trip {
  id: string;
  tripCode: string;
  source: string;
  destination: string;
  vehicleId: string | null;
  driverId: string | null;
  cargoWeightKg: number;
  plannedDistanceKm: number;
  actualDistanceKm: number | null;
  finalOdometerKm: number | null;
  fuelConsumedL: number | null;
  status: TripStatus;
  etaMinutes: number | null;
  createdById: string;
  createdAt: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  serviceType: string;
  cost: number;
  serviceDate: string;
  status: MaintenanceStatus;
  createdAt: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string;
  liters: number;
  cost: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  tripId: string | null;
  vehicleId: string | null;
  toll: number;
  other: number;
  maintenanceLinked: number;
  total: number;
  createdAt: string;
}

export interface Settings {
  depotName: string;
  currency: string;
  distanceUnit: string;
}

// Access levels: NONE, VIEW, FULL
export type AccessLevel = "NONE" | "VIEW" | "FULL";
export type ModuleName = "FLEET" | "DRIVERS" | "TRIPS" | "MAINTENANCE" | "FUEL_EXPENSES" | "ANALYTICS" | "SETTINGS";

export const RBAC_MATRIX: Record<RoleName, Record<ModuleName, AccessLevel>> = {
  FLEET_MANAGER: {
    FLEET: "FULL",
    DRIVERS: "FULL",
    TRIPS: "NONE",
    MAINTENANCE: "FULL",
    FUEL_EXPENSES: "NONE",
    ANALYTICS: "FULL",
    SETTINGS: "FULL",
  },
  DISPATCHER: {
    FLEET: "VIEW",
    DRIVERS: "NONE",
    TRIPS: "FULL",
    MAINTENANCE: "NONE",
    FUEL_EXPENSES: "NONE",
    ANALYTICS: "NONE",
    SETTINGS: "NONE",
  },
  SAFETY_OFFICER: {
    FLEET: "NONE",
    DRIVERS: "FULL",
    TRIPS: "VIEW",
    MAINTENANCE: "VIEW",
    FUEL_EXPENSES: "NONE",
    ANALYTICS: "NONE",
    SETTINGS: "NONE",
  },
  FINANCIAL_ANALYST: {
    FLEET: "VIEW",
    DRIVERS: "NONE",
    TRIPS: "NONE",
    MAINTENANCE: "NONE",
    FUEL_EXPENSES: "FULL",
    ANALYTICS: "FULL",
    SETTINGS: "VIEW",
  },
};

// --- INITIAL SEED DATA ---

const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: "veh-1",
    registrationNo: "GJ01AB4521",
    nameModel: "VAN-05",
    type: "VAN",
    maxLoadCapacityKg: 500,
    odometerKm: 74000,
    acquisitionCost: 620000,
    region: "West",
    status: "AVAILABLE",
    createdAt: "2026-01-10T10:00:00Z",
  },
  {
    id: "veh-2",
    registrationNo: "GJ01AB9981",
    nameModel: "TRUCK-11",
    type: "TRUCK",
    maxLoadCapacityKg: 5000,
    odometerKm: 182000,
    acquisitionCost: 2450000,
    region: "East",
    status: "ON_TRIP",
    createdAt: "2026-01-12T10:00:00Z",
  },
  {
    id: "veh-3",
    registrationNo: "GJ01AB1120",
    nameModel: "MINI-03",
    type: "MINI",
    maxLoadCapacityKg: 1000,
    odometerKm: 66000,
    acquisitionCost: 410000,
    region: "North",
    status: "IN_SHOP",
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "veh-4",
    registrationNo: "GJ01AB0081",
    nameModel: "VAN-09",
    type: "VAN",
    maxLoadCapacityKg: 750,
    odometerKm: 241900,
    acquisitionCost: 590000,
    region: "South",
    status: "RETIRED",
    createdAt: "2026-01-05T10:00:00Z",
  },
];

const INITIAL_DRIVERS: Driver[] = [
  {
    id: "drv-1",
    name: "Alex",
    email: "alex@transitops.in",
    licenseNo: "DL-88213",
    licenseCategory: "LMV",
    licenseExpiry: "2028-12-31T00:00:00Z",
    contactNumber: "9876598765",
    safetyScore: 96,
    status: "AVAILABLE",
    createdAt: "2026-02-01T08:00:00Z",
  },
  {
    id: "drv-2",
    name: "John",
    email: "john@transitops.in",
    licenseNo: "DL-49120",
    licenseCategory: "HMV",
    licenseExpiry: "2025-03-15T00:00:00Z", // Expired
    contactNumber: "9822098220",
    safetyScore: 81,
    status: "SUSPENDED",
    createdAt: "2026-02-05T08:00:00Z",
  },
  {
    id: "drv-3",
    name: "Priya",
    email: "priya@transitops.in",
    licenseNo: "DL-77031",
    licenseCategory: "LMV",
    licenseExpiry: "2028-08-15T00:00:00Z",
    contactNumber: "9911099110",
    safetyScore: 99,
    status: "ON_TRIP",
    createdAt: "2026-02-10T08:00:00Z",
  },
  {
    id: "drv-4",
    name: "Suresh",
    email: "suresh@transitops.in",
    licenseNo: "DL-90045",
    licenseCategory: "HMV",
    licenseExpiry: "2027-01-20T00:00:00Z",
    contactNumber: "9744097440",
    safetyScore: 88,
    status: "OFF_DUTY",
    createdAt: "2026-02-12T08:00:00Z",
  },
];

const INITIAL_TRIPS: Trip[] = [
  {
    id: "trip-1",
    tripCode: "TR001",
    source: "Gandhinagar Depot",
    destination: "Ahmedabad Hub",
    vehicleId: "veh-1",
    driverId: "drv-1",
    cargoWeightKg: 450,
    plannedDistanceKm: 38,
    actualDistanceKm: null,
    finalOdometerKm: null,
    fuelConsumedL: null,
    status: "DISPATCHED",
    etaMinutes: 45,
    createdById: "usr-2",
    createdAt: "2026-07-12T08:00:00Z",
  },
  {
    id: "trip-2",
    tripCode: "TR002",
    source: "Vadodara Hub",
    destination: "Anand Depot",
    vehicleId: "veh-2",
    driverId: "drv-2",
    cargoWeightKg: 4800,
    plannedDistanceKm: 45,
    actualDistanceKm: 45,
    finalOdometerKm: 182000,
    fuelConsumedL: 15,
    status: "COMPLETED",
    etaMinutes: null,
    createdById: "usr-2",
    createdAt: "2026-07-11T10:00:00Z",
  },
  {
    id: "trip-3",
    tripCode: "TR003",
    source: "Ahmedabad Depot",
    destination: "Nadiad Hub",
    vehicleId: "veh-3",
    driverId: "drv-3",
    cargoWeightKg: 800,
    plannedDistanceKm: 52,
    actualDistanceKm: null,
    finalOdometerKm: null,
    fuelConsumedL: null,
    status: "DISPATCHED",
    etaMinutes: 70,
    createdById: "usr-2",
    createdAt: "2026-07-12T07:30:00Z",
  },
  {
    id: "trip-4",
    tripCode: "TR004",
    source: "Vatva Industrial Area",
    destination: "Sanand Warehouse",
    vehicleId: null,
    driverId: "drv-4",
    cargoWeightKg: 2000,
    plannedDistanceKm: 48,
    actualDistanceKm: null,
    finalOdometerKm: null,
    fuelConsumedL: null,
    status: "DRAFT",
    etaMinutes: null,
    createdById: "usr-2",
    createdAt: "2026-07-12T09:00:00Z",
  },
  {
    id: "trip-5",
    tripCode: "TR006",
    source: "Mansa",
    destination: "Kalol Depot",
    vehicleId: null,
    driverId: null,
    cargoWeightKg: 1500,
    plannedDistanceKm: 25,
    actualDistanceKm: null,
    finalOdometerKm: null,
    fuelConsumedL: null,
    status: "CANCELLED",
    etaMinutes: null,
    createdById: "usr-2",
    createdAt: "2026-07-12T06:00:00Z",
  },
];

const INITIAL_MAINTENANCE: MaintenanceLog[] = [
  {
    id: "maint-1",
    vehicleId: "veh-1",
    serviceType: "Oil Change",
    cost: 2500,
    serviceDate: "2026-07-07T00:00:00Z",
    status: "ACTIVE",
    createdAt: "2026-07-07T09:00:00Z",
  },
  {
    id: "maint-2",
    vehicleId: "veh-2",
    serviceType: "Engine Repair",
    cost: 18000,
    serviceDate: "2026-06-15T00:00:00Z",
    status: "COMPLETED",
    createdAt: "2026-06-15T09:00:00Z",
  },
  {
    id: "maint-3",
    vehicleId: "veh-3",
    serviceType: "Tyre Replace",
    cost: 6200,
    serviceDate: "2026-07-10T00:00:00Z",
    status: "ACTIVE",
    createdAt: "2026-07-10T09:00:00Z",
  },
];

const INITIAL_FUEL: FuelLog[] = [
  {
    id: "fuel-1",
    vehicleId: "veh-1",
    date: "2026-07-05T00:00:00Z",
    liters: 42,
    cost: 3150,
    createdAt: "2026-07-05T18:00:00Z",
  },
  {
    id: "fuel-2",
    vehicleId: "veh-2",
    date: "2026-07-06T00:00:00Z",
    liters: 110,
    cost: 8400,
    createdAt: "2026-07-06T18:00:00Z",
  },
  {
    id: "fuel-3",
    vehicleId: "veh-1",
    date: "2026-07-06T00:00:00Z",
    liters: 28,
    cost: 2050,
    createdAt: "2026-07-06T19:00:00Z",
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: "exp-1",
    tripId: "trip-1",
    vehicleId: "veh-1",
    toll: 120,
    other: 0,
    maintenanceLinked: 0,
    total: 120,
    createdAt: "2026-07-12T08:30:00Z",
  },
  {
    id: "exp-2",
    tripId: "trip-2",
    vehicleId: "veh-2",
    toll: 340,
    other: 150,
    maintenanceLinked: 18000,
    total: 18490,
    createdAt: "2026-07-11T12:00:00Z",
  },
];

const INITIAL_SETTINGS: Settings = {
  depotName: "Gandhinagar Depot GIDC",
  currency: "INR",
  distanceUnit: "KM",
};

const SIMULATED_USERS: User[] = [
  {
    id: "usr-1",
    name: "Marcus V.",
    email: "manager@transitops.in",
    role: "FLEET_MANAGER",
    failedLogins: 0,
    lockedUntil: null,
    isActive: true,
  },
  {
    id: "usr-2",
    name: "Rowan K.",
    email: "dispatcher@transitops.in",
    role: "DISPATCHER",
    failedLogins: 0,
    lockedUntil: null,
    isActive: true,
  },
  {
    id: "usr-3",
    name: "Sarah T.",
    email: "safety@transitops.in",
    role: "SAFETY_OFFICER",
    failedLogins: 0,
    lockedUntil: null,
    isActive: true,
  },
  {
    id: "usr-4",
    name: "Elena P.",
    email: "analyst@transitops.in",
    role: "FINANCIAL_ANALYST",
    failedLogins: 0,
    lockedUntil: null,
    isActive: true,
  },
];

// --- MOCK CONTEXT STATE INTERFACE ---

interface MockDataContextType {
  // States
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenanceLogs: MaintenanceLog[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  settings: Settings;
  currentUser: User | null;
  failedAttempts: Record<string, number>;
  lockedAccounts: Record<string, string | null>; // email -> iso date string

  // User Actions
  login: (email: string, role?: RoleName) => { success: boolean; error?: string };
  logout: () => void;
  switchRole: (role: RoleName) => void;

  // Vehicle CRUD
  addVehicle: (vehicle: Omit<Vehicle, "id" | "status" | "createdAt">) => { success: boolean; error?: string };
  retireVehicle: (id: string) => void;
  updateVehicleStatus: (id: string, status: VehicleStatus) => void;

  // Driver CRUD
  addDriver: (driver: Omit<Driver, "id" | "status" | "createdAt">) => { success: boolean; error?: string };
  updateDriverStatus: (id: string, status: DriverStatus) => void;

  // Trip CRUD
  createTrip: (trip: Omit<Trip, "id" | "tripCode" | "status" | "actualDistanceKm" | "finalOdometerKm" | "fuelConsumedL" | "createdById" | "createdAt">) => { success: boolean; error?: string };
  dispatchTrip: (id: string) => { success: boolean; error?: string };
  cancelTrip: (id: string) => void;
  completeTrip: (id: string, finalOdometerKm: number, fuelConsumedL: number) => { success: boolean; error?: string };

  // Maintenance Actions
  addMaintenanceLog: (log: Omit<MaintenanceLog, "id" | "createdAt">) => { success: boolean; error?: string };
  completeMaintenanceLog: (id: string) => void;

  // Fuel & Expense Actions
  addFuelLog: (log: Omit<FuelLog, "id" | "createdAt">) => void;
  addExpense: (expense: Omit<Expense, "id" | "total" | "createdAt">) => void;

  // Settings Action
  updateSettings: (settings: Settings) => void;

  // Formatters
  formatCurrency: (amount: number) => string;
  formatDistance: (km: number) => string;

  // Dynamic user registry for registration page
  users: User[];
  register: (name: string, email: string, role: RoleName) => { success: boolean; error?: string };
}

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

export const MockDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);

  // Core Entity States
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>(INITIAL_MAINTENANCE);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(INITIAL_FUEL);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);

  // Auth States
  const [users, setUsers] = useState<User[]>(SIMULATED_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<Record<string, number>>({});
  const [lockedAccounts, setLockedAccounts] = useState<Record<string, string | null>>({});

  // 1. Sync from localStorage on mount (hydration safety)
  useEffect(() => {
    setIsClient(true);
    const getLocal = <T,>(key: string, fallback: T): T => {
      const data = localStorage.getItem(`transitops_${key}`);
      return data ? JSON.parse(data) : fallback;
    };

    setVehicles(getLocal("vehicles", INITIAL_VEHICLES));
    setDrivers(getLocal("drivers", INITIAL_DRIVERS));
    setTrips(getLocal("trips", INITIAL_TRIPS));
    setMaintenanceLogs(getLocal("maintenance", INITIAL_MAINTENANCE));
    setFuelLogs(getLocal("fuel", INITIAL_FUEL));
    setExpenses(getLocal("expenses", INITIAL_EXPENSES));
    setSettings(getLocal("settings", INITIAL_SETTINGS));
    setUsers(getLocal("users", SIMULATED_USERS));

    // Check if session cookie exists
    const sessionCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("transitops_session="));

    if (sessionCookie) {
      try {
        const sessionUser = JSON.parse(decodeURIComponent(sessionCookie.split("=")[1]));
        setCurrentUser(sessionUser);
      } catch (e) {
        console.error("Session parse error", e);
      }
    }
  }, []);

  // 2. Persist states helper
  const saveToLocal = (key: string, data: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`transitops_${key}`, JSON.stringify(data));
    }
  };

  // Helper effect to trigger license expiry checks on loading
  useEffect(() => {
    if (!isClient) return;
    const now = new Date();
    // In our seed John has an expired license. If drivers are loaded, check their expiry dates
    // and flag if needed. The validation happens on assignment.
  }, [isClient]);

  // --- ACTIONS IMPLEMENTATION ---

  // Authentication
  const login = (email: string, role?: RoleName) => {
    // Check account lock
    const lockedUntilStr = lockedAccounts[email];
    if (lockedUntilStr) {
      const lockedUntil = new Date(lockedUntilStr);
      if (new Date() < lockedUntil) {
        const minsLeft = Math.ceil((lockedUntil.getTime() - new Date().getTime()) / 60000);
        return {
          success: false,
          error: `Account locked due to 5 failed attempts. Try again in ${minsLeft} minutes.`
        };
      } else {
        // Unlock
        const newLocks = { ...lockedAccounts };
        delete newLocks[email];
        setLockedAccounts(newLocks);
        saveToLocal("locked_accounts", newLocks);
      }
    }

    // Match user by email address only
    const matchedUser = users.find(
      (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (matchedUser) {
      // Clear failed logins
      const newFailed = { ...failedAttempts };
      delete newFailed[email];
      setFailedAttempts(newFailed);

      setCurrentUser(matchedUser);
      // Set session cookie (valid for 1 day)
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 1);
      document.cookie = `transitops_session=${encodeURIComponent(JSON.stringify(matchedUser))}; path=/; expires=${expiry.toUTCString()}`;

      return { success: true };
    } else {
      // Increment failed logins
      const attempts = (failedAttempts[email] || 0) + 1;
      const newFailed = { ...failedAttempts, [email]: attempts };
      setFailedAttempts(newFailed);

      if (attempts >= 5) {
        const lockTime = new Date();
        lockTime.setMinutes(lockTime.getMinutes() + 15); // lock for 15 minutes
        const newLocks = { ...lockedAccounts, [email]: lockTime.toISOString() };
        setLockedAccounts(newLocks);
        saveToLocal("locked_accounts", newLocks);
        return {
          success: false,
          error: "Account locked. Too many failed attempts. Account locked after 5 failed attempts."
        };
      }

      return {
        success: false,
        error: `Invalid credentials. Attempt ${attempts} of 5 before account lock.`
      };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    document.cookie = "transitops_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
  };

  const register = (name: string, email: string, role: RoleName) => {
    const exists = users.some(
      (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim() && u.role === role
    );
    if (exists) {
      return { success: false, error: `A user with email '${email}' and role '${role}' already exists.` };
    }

    const created: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      failedLogins: 0,
      lockedUntil: null,
      isActive: true,
    };

    const updated = [...users, created];
    setUsers(updated);
    saveToLocal("users", updated);
    return { success: true };
  };

  const switchRole = (role: RoleName) => {
    if (!currentUser) return;
    const defaultUsers: Record<RoleName, User> = {
      FLEET_MANAGER: SIMULATED_USERS[0],
      DISPATCHER: SIMULATED_USERS[1],
      SAFETY_OFFICER: SIMULATED_USERS[2],
      FINANCIAL_ANALYST: SIMULATED_USERS[3],
    };
    const newUser = defaultUsers[role];
    setCurrentUser(newUser);
    document.cookie = `transitops_session=${encodeURIComponent(JSON.stringify(newUser))}; path=/`;
  };

  // Vehicles
  const addVehicle = (newVeh: Omit<Vehicle, "id" | "status" | "createdAt">) => {
    // Unique registration validation
    const exists = vehicles.some(
      (v) => v.registrationNo.toLowerCase().trim() === newVeh.registrationNo.toLowerCase().trim()
    );
    if (exists) {
      return { success: false, error: `Vehicle registration number '${newVeh.registrationNo}' already exists.` };
    }

    const created: Vehicle = {
      ...newVeh,
      id: `veh-${Date.now()}`,
      status: "AVAILABLE",
      createdAt: new Date().toISOString(),
    };

    const updated = [created, ...vehicles];
    setVehicles(updated);
    saveToLocal("vehicles", updated);
    return { success: true };
  };

  const retireVehicle = (id: string) => {
    const updated = vehicles.map((v) => (v.id === id ? { ...v, status: "RETIRED" as const } : v));
    setVehicles(updated);
    saveToLocal("vehicles", updated);
  };

  const updateVehicleStatus = (id: string, status: VehicleStatus) => {
    const updated = vehicles.map((v) => (v.id === id ? { ...v, status } : v));
    setVehicles(updated);
    saveToLocal("vehicles", updated);
  };

  // Drivers
  const addDriver = (newDrv: Omit<Driver, "id" | "status" | "createdAt">) => {
    const exists = drivers.some(
      (d) => d.licenseNo.toLowerCase().trim() === newDrv.licenseNo.toLowerCase().trim()
    );
    if (exists) {
      return { success: false, error: `Driver with license number '${newDrv.licenseNo}' already exists.` };
    }

    const created: Driver = {
      ...newDrv,
      id: `drv-${Date.now()}`,
      status: "AVAILABLE",
      createdAt: new Date().toISOString(),
    };

    const updated = [created, ...drivers];
    setDrivers(updated);
    saveToLocal("drivers", updated);
    return { success: true };
  };

  const updateDriverStatus = (id: string, status: DriverStatus) => {
    const updated = drivers.map((d) => (d.id === id ? { ...d, status } : d));
    setDrivers(updated);
    saveToLocal("drivers", updated);
  };

  // Trips
  const createTrip = (newTrip: Omit<Trip, "id" | "tripCode" | "status" | "actualDistanceKm" | "finalOdometerKm" | "fuelConsumedL" | "createdById" | "createdAt">) => {
    // Generate code e.g. TR008
    const tripNum = trips.length + 1;
    const tripCode = `TR${String(tripNum).padStart(3, "0")}`;

    const created: Trip = {
      ...newTrip,
      id: `trip-${Date.now()}`,
      tripCode,
      status: "DRAFT",
      actualDistanceKm: null,
      finalOdometerKm: null,
      fuelConsumedL: null,
      createdById: currentUser?.id || "usr-2",
      createdAt: new Date().toISOString(),
    };

    const updated = [created, ...trips];
    setTrips(updated);
    saveToLocal("trips", updated);
    return { success: true };
  };

  const dispatchTrip = (id: string) => {
    const trip = trips.find((t) => t.id === id);
    if (!trip) return { success: false, error: "Trip not found." };

    if (!trip.vehicleId || !trip.driverId) {
      return { success: false, error: "Trip must have an assigned vehicle and driver before dispatching." };
    }

    const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
    const driver = drivers.find((d) => d.id === trip.driverId);

    if (!vehicle) return { success: false, error: "Assigned vehicle not found." };
    if (!driver) return { success: false, error: "Assigned driver not found." };

    // Validations:
    // 1. Cargo capacity
    if (Number(trip.cargoWeightKg) > Number(vehicle.maxLoadCapacityKg)) {
      return {
        success: false,
        error: `Cargo weight (${trip.cargoWeightKg} kg) exceeds vehicle maximum capacity (${vehicle.maxLoadCapacityKg} kg). Dispatch blocked.`
      };
    }

    // 2. Driver status (must be available)
    if (driver.status !== "AVAILABLE") {
      return { success: false, error: `Driver ${driver.name} is currently ${driver.status} and cannot be assigned.` };
    }

    // 3. Driver license expiry check
    if (new Date(driver.licenseExpiry) < new Date()) {
      return { success: false, error: `Driver ${driver.name}'s license is expired. Dispatch blocked.` };
    }

    // 4. Vehicle status (must be available)
    if (vehicle.status !== "AVAILABLE") {
      return { success: false, error: `Vehicle ${vehicle.nameModel} is currently ${vehicle.status} and cannot be assigned.` };
    }

    // Atomic Status transitions:
    // set Trip status to DISPATCHED
    // set Vehicle status to ON_TRIP
    // set Driver status to ON_TRIP
    const updatedTrips = trips.map((t) => (t.id === id ? { ...t, status: "DISPATCHED" as const, etaMinutes: Math.floor(Math.random() * 90) + 30 } : t));
    const updatedVehicles = vehicles.map((v) => (v.id === vehicle.id ? { ...v, status: "ON_TRIP" as const } : v));
    const updatedDrivers = drivers.map((d) => (d.id === driver.id ? { ...d, status: "ON_TRIP" as const } : d));

    setTrips(updatedTrips);
    setVehicles(updatedVehicles);
    setDrivers(updatedDrivers);

    saveToLocal("trips", updatedTrips);
    saveToLocal("vehicles", updatedVehicles);
    saveToLocal("drivers", updatedDrivers);

    return { success: true };
  };

  const cancelTrip = (id: string) => {
    const trip = trips.find((t) => t.id === id);
    if (!trip) return;

    const updatedTrips = trips.map((t) => (t.id === id ? { ...t, status: "CANCELLED" as const, etaMinutes: null } : t));

    // Free vehicle and driver if they were dispatched
    let updatedVehicles = vehicles;
    let updatedDrivers = drivers;

    if (trip.status === "DISPATCHED") {
      if (trip.vehicleId) {
        updatedVehicles = vehicles.map((v) => (v.id === trip.vehicleId ? { ...v, status: "AVAILABLE" as const } : v));
      }
      if (trip.driverId) {
        updatedDrivers = drivers.map((d) => (d.id === trip.driverId ? { ...d, status: "AVAILABLE" as const } : d));
      }
    }

    setTrips(updatedTrips);
    setVehicles(updatedVehicles);
    setDrivers(updatedDrivers);

    saveToLocal("trips", updatedTrips);
    saveToLocal("vehicles", updatedVehicles);
    saveToLocal("drivers", updatedDrivers);
  };

  const completeTrip = (id: string, finalOdometerKm: number, fuelConsumedL: number) => {
    const trip = trips.find((t) => t.id === id);
    if (!trip) return { success: false, error: "Trip not found." };
    if (!trip.vehicleId) return { success: false, error: "No vehicle linked to trip." };

    const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
    if (!vehicle) return { success: false, error: "Vehicle not found." };

    // Validation: final odometer cannot be less than current odometer
    if (finalOdometerKm < Number(vehicle.odometerKm)) {
      return {
        success: false,
        error: `Final odometer (${finalOdometerKm} km) cannot be less than starting odometer (${vehicle.odometerKm} km).`
      };
    }

    const tripDistance = finalOdometerKm - Number(vehicle.odometerKm);

    // Update Trip: COMPLETED, actualDistanceKm, finalOdometerKm, fuelConsumedL
    const updatedTrips = trips.map((t) =>
      t.id === id
        ? {
          ...t,
          status: "COMPLETED" as const,
          actualDistanceKm: tripDistance,
          finalOdometerKm,
          fuelConsumedL,
          etaMinutes: null
        }
        : t
    );

    // Update Vehicle: AVAILABLE, odometerKm = finalOdometerKm
    const updatedVehicles = vehicles.map((v) =>
      v.id === trip.vehicleId
        ? {
          ...v,
          status: "AVAILABLE" as const,
          odometerKm: finalOdometerKm
        }
        : v
    );

    // Update Driver: AVAILABLE
    let updatedDrivers = drivers;
    if (trip.driverId) {
      updatedDrivers = drivers.map((d) =>
        d.id === trip.driverId
          ? {
            ...d,
            status: "AVAILABLE" as const
          }
          : d
      );
    }

    // Log Fuel Log automatically based on trip completion fuel
    const newFuelLog: FuelLog = {
      id: `fuel-${Date.now()}`,
      vehicleId: trip.vehicleId,
      date: new Date().toISOString(),
      liters: fuelConsumedL,
      cost: fuelConsumedL * 95, // approximate Fuel cost (e.g. 95 INR per liter)
      createdAt: new Date().toISOString(),
    };
    const updatedFuel = [newFuelLog, ...fuelLogs];

    // Log toll/trip expense automatically
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      tripId: trip.id,
      vehicleId: trip.vehicleId,
      toll: Math.floor(Math.random() * 200) + 50, // random toll
      other: Math.floor(Math.random() * 100) + 10, // random other expense
      maintenanceLinked: 0,
      total: 0, // will calculate below
      createdAt: new Date().toISOString(),
    };
    newExpense.total = newExpense.toll + newExpense.other;
    const updatedExpenses = [newExpense, ...expenses];

    setTrips(updatedTrips);
    setVehicles(updatedVehicles);
    setDrivers(updatedDrivers);
    setFuelLogs(updatedFuel);
    setExpenses(updatedExpenses);

    saveToLocal("trips", updatedTrips);
    saveToLocal("vehicles", updatedVehicles);
    saveToLocal("drivers", updatedDrivers);
    saveToLocal("fuel", updatedFuel);
    saveToLocal("expenses", updatedExpenses);

    return { success: true };
  };

  // Maintenance
  const addMaintenanceLog = (newLog: Omit<MaintenanceLog, "id" | "createdAt">) => {
    const vehicle = vehicles.find((v) => v.id === newLog.vehicleId);
    if (!vehicle) return { success: false, error: "Vehicle not found." };

    const created: MaintenanceLog = {
      ...newLog,
      id: `maint-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updatedLogs = [created, ...maintenanceLogs];
    setMaintenanceLogs(updatedLogs);
    saveToLocal("maintenance", updatedLogs);

    // If active maintenance is logged, vehicle changes to IN_SHOP
    if (newLog.status === "ACTIVE") {
      updateVehicleStatus(newLog.vehicleId, "IN_SHOP");
    }

    // Link this as an expense
    const newExpense: Expense = {
      id: `exp-m-${Date.now()}`,
      tripId: null,
      vehicleId: newLog.vehicleId,
      toll: 0,
      other: 0,
      maintenanceLinked: newLog.cost,
      total: newLog.cost,
      createdAt: new Date().toISOString(),
    };
    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);
    saveToLocal("expenses", updatedExpenses);

    return { success: true };
  };

  const completeMaintenanceLog = (id: string) => {
    const log = maintenanceLogs.find((l) => l.id === id);
    if (!log) return;

    const updatedLogs = maintenanceLogs.map((l) => (l.id === id ? { ...l, status: "COMPLETED" as const } : l));
    setMaintenanceLogs(updatedLogs);
    saveToLocal("maintenance", updatedLogs);

    // Set vehicle back to AVAILABLE (unless retired)
    const vehicle = vehicles.find((v) => v.id === log.vehicleId);
    if (vehicle && vehicle.status !== "RETIRED") {
      updateVehicleStatus(log.vehicleId, "AVAILABLE");
    }
  };

  // Fuel & Expense
  const addFuelLog = (newFuel: Omit<FuelLog, "id" | "createdAt">) => {
    const created: FuelLog = {
      ...newFuel,
      id: `fuel-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [created, ...fuelLogs];
    setFuelLogs(updated);
    saveToLocal("fuel", updated);
  };

  const addExpense = (newExp: Omit<Expense, "id" | "total" | "createdAt">) => {
    const total = Number(newExp.toll) + Number(newExp.other) + Number(newExp.maintenanceLinked);
    const created: Expense = {
      ...newExp,
      id: `exp-${Date.now()}`,
      total,
      createdAt: new Date().toISOString(),
    };
    const updated = [created, ...expenses];
    setExpenses(updated);
    saveToLocal("expenses", updated);
  };

  // Settings
  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    saveToLocal("settings", newSettings);
  };

  // Formatters
  const formatCurrency = (amount: number) => {
    const symbolMap: Record<string, { locale: string; currency: string }> = {
      INR: { locale: "en-IN", currency: "INR" },
      USD: { locale: "en-US", currency: "USD" },
      EUR: { locale: "en-IE", currency: "EUR" },
      GBP: { locale: "en-GB", currency: "GBP" },
    };

    const config = symbolMap[settings.currency] || { locale: "en-IN", currency: "INR" };
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDistance = (km: number) => {
    if (settings.distanceUnit === "MILES") {
      const miles = Math.round(km * 0.621371);
      return `${miles} mi`;
    }
    return `${km} km`;
  };

  return (
    <MockDataContext.Provider
      value={{
        vehicles,
        drivers,
        trips,
        maintenanceLogs,
        fuelLogs,
        expenses,
        settings,
        currentUser,
        failedAttempts,
        lockedAccounts,
        login,
        logout,
        switchRole,
        addVehicle,
        retireVehicle,
        updateVehicleStatus,
        addDriver,
        updateDriverStatus,
        createTrip,
        dispatchTrip,
        cancelTrip,
        completeTrip,
        addMaintenanceLog,
        completeMaintenanceLog,
        addFuelLog,
        addExpense,
        updateSettings,
        formatCurrency,
        formatDistance,
        users,
        register,
      }}
    >
      {isClient ? children : null}
    </MockDataContext.Provider>
  );
};

export const useMockData = () => {
  const context = useContext(MockDataContext);
  if (!context) {
    throw new Error("useMockData must be used within a MockDataProvider");
  }
  return context;
};
