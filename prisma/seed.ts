/**
 * Prisma Seed Script — TransitOps
 * Populates the database with sample data for development/testing.
 *
 * Run with: npx prisma db seed
 */

import "dotenv/config";
import { PrismaClient, Role, DriverStatus, VehicleType, VehicleStatus, TripStatus, MaintenanceStatus } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // ─── Clean slate ────────────────────────────────────────────────
  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.user.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.organization.deleteMany();

  console.log("🗑️  Cleared existing data");

  // ─── Organization ────────────────────────────────────────────────
  const org = await prisma.organization.create({
    data: {
      name: "TransitOps Demo",
      slug: "transitops-demo",
      settings: {
        timezone: "Asia/Kolkata",
        currency: "INR",
        distanceUnit: "km",
        fuelUnit: "liters",
      },
    },
  });
  console.log(`✅ Organization created: ${org.name} (${org.id})`);

  // ─── Users ───────────────────────────────────────────────────────
  const fleetManagerPw = await bcrypt.hash("Manager@123", 12);
  const fleetManager = await prisma.user.create({
    data: {
      name: "Fleet Manager",
      email: "manager@transitops.com",
      passwordHash: fleetManagerPw,
      role: Role.FLEET_MANAGER,
      organizationId: org.id,
    },
  });
  console.log(`✅ Fleet Manager created: ${fleetManager.email}`);

  const dispatcherPw = await bcrypt.hash("Dispatcher@123", 12);
  const dispatcher = await prisma.user.create({
    data: {
      name: "Dispatcher",
      email: "dispatcher@transitops.com",
      passwordHash: dispatcherPw,
      role: Role.DISPATCHER,
      organizationId: org.id,
    },
  });
  console.log(`✅ Dispatcher created: ${dispatcher.email}`);

  const safetyOfficerPw = await bcrypt.hash("Safety@123", 12);
  await prisma.user.create({
    data: {
      name: "Safety Officer",
      email: "safety@transitops.com",
      passwordHash: safetyOfficerPw,
      role: Role.SAFETY_OFFICER,
      organizationId: org.id,
    },
  });
  console.log(`✅ Safety Officer created`);

  const financialPw = await bcrypt.hash("Finance@123", 12);
  await prisma.user.create({
    data: {
      name: "Financial Analyst",
      email: "finance@transitops.com",
      passwordHash: financialPw,
      role: Role.FINANCIAL_ANALYST,
      organizationId: org.id,
    },
  });
  console.log(`✅ Financial Analyst created`);

  // ─── Drivers ─────────────────────────────────────────────────────
  const today = new Date();
  const nextYear = new Date(today.getFullYear() + 1, 11, 31);

  const driver1 = await prisma.driver.create({
    data: {
      name: "Raj Patel",
      email: "raj.patel@transitops.com",
      licenseNo: "GJ01-DL-2018-001",
      licenseCategory: "HMV",
      licenseExpiry: nextYear,
      contactNumber: "+91 98765 43210",
      safetyScore: 92,
      status: DriverStatus.AVAILABLE,
      organizationId: org.id,
    },
  });

  const driver2 = await prisma.driver.create({
    data: {
      name: "Suresh Kumar",
      email: "suresh.kumar@transitops.com",
      licenseNo: "GJ01-DL-2019-002",
      licenseCategory: "HMV",
      licenseExpiry: nextYear,
      contactNumber: "+91 98765 43211",
      safetyScore: 88,
      status: DriverStatus.AVAILABLE,
      organizationId: org.id,
    },
  });

  await prisma.driver.create({
    data: {
      name: "Meena Shah",
      email: "meena.shah@transitops.com",
      licenseNo: "GJ01-DL-2020-003",
      licenseCategory: "LMV",
      licenseExpiry: nextYear,
      contactNumber: "+91 98765 43212",
      safetyScore: 95,
      status: DriverStatus.OFF_DUTY,
      organizationId: org.id,
    },
  });

  console.log("✅ 3 drivers created");

  // ─── Vehicles ────────────────────────────────────────────────────
  const vehicle1 = await prisma.vehicle.create({
    data: {
      registrationNo: "GJ-01-AB-1234",
      nameModel: "Tata Starbus 2022",
      type: VehicleType.BUS,
      maxLoadCapacityKg: 5000,
      odometerKm: 24500,
      acquisitionCost: 2500000,
      region: "Ahmedabad",
      status: VehicleStatus.AVAILABLE,
      organizationId: org.id,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      registrationNo: "GJ-01-CD-5678",
      nameModel: "Mahindra Supro 2021",
      type: VehicleType.TRUCK,
      maxLoadCapacityKg: 3000,
      odometerKm: 18200,
      acquisitionCost: 1800000,
      region: "Surat",
      status: VehicleStatus.AVAILABLE,
      organizationId: org.id,
    },
  });

  const vehicle3 = await prisma.vehicle.create({
    data: {
      registrationNo: "GJ-01-EF-9012",
      nameModel: "Toyota Innova Crysta 2020",
      type: VehicleType.VAN,
      maxLoadCapacityKg: 800,
      odometerKm: 42000,
      acquisitionCost: 2200000,
      region: "Ahmedabad",
      status: VehicleStatus.IN_SHOP,
      organizationId: org.id,
    },
  });

  console.log("✅ 3 vehicles created");

  // ─── Trips ───────────────────────────────────────────────────────
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const trip1 = await prisma.trip.create({
    data: {
      tripCode: "TR001",
      vehicleId: vehicle1.id,
      driverId: driver1.id,
      source: "Ahmedabad Central Depot",
      destination: "Gandhinagar Bus Stand",
      cargoWeightKg: 1200,
      plannedDistanceKm: 32.5,
      actualDistanceKm: 34.1,
      finalOdometerKm: 24534,
      fuelConsumedL: 8.2,
      status: TripStatus.COMPLETED,
      createdById: fleetManager.id,
      organizationId: org.id,
    },
  });

  const trip2 = await prisma.trip.create({
    data: {
      tripCode: "TR002",
      vehicleId: vehicle2.id,
      driverId: driver2.id,
      source: "Surat Railway Station",
      destination: "Surat Airport",
      cargoWeightKg: 600,
      plannedDistanceKm: 18.2,
      status: TripStatus.DISPATCHED,
      etaMinutes: 25,
      createdById: dispatcher.id,
      organizationId: org.id,
    },
  });

  await prisma.trip.create({
    data: {
      tripCode: "TR003",
      vehicleId: vehicle1.id,
      driverId: driver1.id,
      source: "Ahmedabad Central Depot",
      destination: "Vadodara Bus Stand",
      cargoWeightKg: 2000,
      plannedDistanceKm: 115.0,
      status: TripStatus.DRAFT,
      createdById: fleetManager.id,
      organizationId: org.id,
    },
  });

  console.log("✅ 3 trips created");

  // ─── Maintenance Records ─────────────────────────────────────────
  await prisma.maintenanceRecord.create({
    data: {
      vehicleId: vehicle3.id,
      serviceType: "Engine Repair",
      cost: 8500,
      serviceDate: today,
      status: MaintenanceStatus.ACTIVE,
      organizationId: org.id,
    },
  });

  await prisma.maintenanceRecord.create({
    data: {
      vehicleId: vehicle1.id,
      serviceType: "Routine Service",
      cost: 4500,
      serviceDate: tomorrow,
      status: MaintenanceStatus.COMPLETED,
      organizationId: org.id,
    },
  });

  console.log("✅ 2 maintenance records created");

  // ─── Fuel Logs ───────────────────────────────────────────────────
  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicle1.id,
      date: yesterday,
      liters: 80,
      cost: 7720,
      organizationId: org.id,
    },
  });

  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicle2.id,
      date: today,
      liters: 45,
      cost: 4342.5,
      organizationId: org.id,
    },
  });

  console.log("✅ 2 fuel logs created");

  // ─── Expenses ────────────────────────────────────────────────────
  await prisma.expense.create({
    data: {
      toll: 0,
      other: 0,
      maintenanceLinked: 7720,
      total: 7720,
      vehicleId: vehicle1.id,
      tripId: trip1.id,
      organizationId: org.id,
      createdBy: fleetManager.id,
    },
  });

  await prisma.expense.create({
    data: {
      toll: 340,
      other: 50,
      maintenanceLinked: 0,
      total: 390,
      vehicleId: vehicle2.id,
      tripId: trip2.id,
      organizationId: org.id,
      createdBy: dispatcher.id,
    },
  });

  await prisma.expense.create({
    data: {
      toll: 0,
      other: 0,
      maintenanceLinked: 4500,
      total: 4500,
      vehicleId: vehicle1.id,
      organizationId: org.id,
      createdBy: fleetManager.id,
    },
  });

  console.log("✅ 3 expenses created");

  // ─── Settings ────────────────────────────────────────────────────
  await prisma.settings.createMany({
    data: [
      { organizationId: org.id, key: "notifications.email", value: "true" },
      { organizationId: org.id, key: "notifications.sms", value: "false" },
      { organizationId: org.id, key: "maintenance.alertDaysBefore", value: "7" },
      { organizationId: org.id, key: "trip.maxDailyHours", value: "10" },
    ],
  });

  console.log("✅ 4 settings created");

  // ─── Summary ─────────────────────────────────────────────────────
  console.log("\n🎉 Seed completed successfully!");
  console.log("─".repeat(40));
  console.log("📧 Manager:  manager@transitops.com / Manager@123");
  console.log("📧 Dispatcher: dispatcher@transitops.com / Dispatcher@123");
  console.log("📧 Safety:   safety@transitops.com / Safety@123");
  console.log("📧 Finance:  finance@transitops.com / Finance@123");
  console.log("─".repeat(40));
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
