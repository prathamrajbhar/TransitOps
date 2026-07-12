/**
 * Prisma Seed Script — TransitOps
 * Populates the database with sample data for development/testing.
 *
 * Run with: npx prisma db seed
 */

import { PrismaClient, Role, DriverStatus, VehicleType, VehicleStatus, TripStatus, MaintenanceType, MaintenanceStatus, ExpenseCategory } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

  // ─── Admin User ──────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@transitops.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      organizationId: org.id,
    },
  });
  console.log(`✅ Admin user created: ${adminUser.email}`);

  // ─── Manager User ────────────────────────────────────────────────
  const managerPassword = await bcrypt.hash("Manager@123", 12);
  const managerUser = await prisma.user.create({
    data: {
      name: "Fleet Manager",
      email: "manager@transitops.com",
      passwordHash: managerPassword,
      role: Role.MANAGER,
      organizationId: org.id,
    },
  });
  console.log(`✅ Manager user created: ${managerUser.email}`);

  // ─── Driver Users ────────────────────────────────────────────────
  const driver1Password = await bcrypt.hash("Driver@123", 12);
  const driverUser1 = await prisma.user.create({
    data: {
      name: "Raj Patel",
      email: "raj.patel@transitops.com",
      passwordHash: driver1Password,
      role: Role.DRIVER,
      organizationId: org.id,
    },
  });

  const driver2Password = await bcrypt.hash("Driver@123", 12);
  const driverUser2 = await prisma.user.create({
    data: {
      name: "Suresh Kumar",
      email: "suresh.kumar@transitops.com",
      passwordHash: driver2Password,
      role: Role.DRIVER,
      organizationId: org.id,
    },
  });

  const driver3Password = await bcrypt.hash("Driver@123", 12);
  const driverUser3 = await prisma.user.create({
    data: {
      name: "Meena Shah",
      email: "meena.shah@transitops.com",
      passwordHash: driver3Password,
      role: Role.DRIVER,
      organizationId: org.id,
    },
  });

  console.log("✅ 3 driver users created");

  // ─── Drivers ─────────────────────────────────────────────────────
  const driver1 = await prisma.driver.create({
    data: {
      name: "Raj Patel",
      email: "raj.patel@transitops.com",
      phone: "+91 98765 43210",
      licenseNumber: "GJ01-DL-2018-001",
      status: DriverStatus.ACTIVE,
      organizationId: org.id,
      userId: driverUser1.id,
    },
  });

  const driver2 = await prisma.driver.create({
    data: {
      name: "Suresh Kumar",
      email: "suresh.kumar@transitops.com",
      phone: "+91 98765 43211",
      licenseNumber: "GJ01-DL-2019-002",
      status: DriverStatus.ACTIVE,
      organizationId: org.id,
      userId: driverUser2.id,
    },
  });

  const driver3 = await prisma.driver.create({
    data: {
      name: "Meena Shah",
      email: "meena.shah@transitops.com",
      phone: "+91 98765 43212",
      licenseNumber: "GJ01-DL-2020-003",
      status: DriverStatus.ON_LEAVE,
      organizationId: org.id,
      userId: driverUser3.id,
    },
  });

  console.log("✅ 3 drivers created");

  // ─── Vehicles ────────────────────────────────────────────────────
  const vehicle1 = await prisma.vehicle.create({
    data: {
      plateNumber: "GJ-01-AB-1234",
      make: "Tata",
      model: "Starbus",
      year: 2022,
      type: VehicleType.BUS,
      status: VehicleStatus.ACTIVE,
      organizationId: org.id,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      plateNumber: "GJ-01-CD-5678",
      make: "Mahindra",
      model: "Supro",
      year: 2021,
      type: VehicleType.MINIBUS,
      status: VehicleStatus.ACTIVE,
      organizationId: org.id,
    },
  });

  const vehicle3 = await prisma.vehicle.create({
    data: {
      plateNumber: "GJ-01-EF-9012",
      make: "Toyota",
      model: "Innova Crysta",
      year: 2020,
      type: VehicleType.VAN,
      status: VehicleStatus.IN_MAINTENANCE,
      organizationId: org.id,
    },
  });

  console.log("✅ 3 vehicles created");

  // ─── Trips ───────────────────────────────────────────────────────
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const trip1 = await prisma.trip.create({
    data: {
      vehicleId: vehicle1.id,
      driverId: driver1.id,
      origin: "Ahmedabad Central Depot",
      destination: "Gandhinagar Bus Stand",
      distanceKm: 32.5,
      startTime: yesterday,
      endTime: new Date(yesterday.getTime() + 90 * 60 * 1000),
      status: TripStatus.COMPLETED,
      organizationId: org.id,
    },
  });

  const trip2 = await prisma.trip.create({
    data: {
      vehicleId: vehicle2.id,
      driverId: driver2.id,
      origin: "Surat Railway Station",
      destination: "Surat Airport",
      distanceKm: 18.2,
      startTime: now,
      status: TripStatus.IN_PROGRESS,
      organizationId: org.id,
    },
  });

  await prisma.trip.create({
    data: {
      vehicleId: vehicle1.id,
      driverId: driver1.id,
      origin: "Ahmedabad Central Depot",
      destination: "Vadodara Bus Stand",
      distanceKm: 115.0,
      startTime: tomorrow,
      status: TripStatus.SCHEDULED,
      organizationId: org.id,
    },
  });

  console.log("✅ 3 trips created");

  // ─── Maintenance Records ─────────────────────────────────────────
  await prisma.maintenanceRecord.create({
    data: {
      vehicleId: vehicle3.id,
      type: MaintenanceType.CORRECTIVE,
      description: "Engine oil leak — gasket replacement required",
      scheduledAt: now,
      status: MaintenanceStatus.IN_PROGRESS,
      organizationId: org.id,
    },
  });

  await prisma.maintenanceRecord.create({
    data: {
      vehicleId: vehicle1.id,
      type: MaintenanceType.PREVENTIVE,
      description: "Routine service — 10,000 km service interval",
      scheduledAt: tomorrow,
      costAmount: 4500,
      status: MaintenanceStatus.SCHEDULED,
      organizationId: org.id,
    },
  });

  console.log("✅ 2 maintenance records created");

  // ─── Fuel Logs ───────────────────────────────────────────────────
  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicle1.id,
      driverId: driver1.id,
      liters: 80,
      costPerLiter: 96.5,
      totalCost: 7720,
      odometerKm: 24500,
      station: "HP Petrol Pump, SG Highway",
      organizationId: org.id,
    },
  });

  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicle2.id,
      driverId: driver2.id,
      liters: 45,
      costPerLiter: 96.5,
      totalCost: 4342.5,
      odometerKm: 18200,
      station: "Indian Oil, Surat",
      organizationId: org.id,
    },
  });

  console.log("✅ 2 fuel logs created");

  // ─── Expenses ────────────────────────────────────────────────────
  await prisma.expense.create({
    data: {
      category: ExpenseCategory.FUEL,
      amount: 7720,
      description: "Fuel refill — HP Pump SG Highway",
      vehicleId: vehicle1.id,
      tripId: trip1.id,
      organizationId: org.id,
      createdBy: adminUser.id,
    },
  });

  await prisma.expense.create({
    data: {
      category: ExpenseCategory.TOLL,
      amount: 340,
      description: "Toll charges — Expressway",
      vehicleId: vehicle2.id,
      tripId: trip2.id,
      organizationId: org.id,
      createdBy: managerUser.id,
    },
  });

  await prisma.expense.create({
    data: {
      category: ExpenseCategory.MAINTENANCE,
      amount: 4500,
      description: "Routine service budget — vehicle 1",
      vehicleId: vehicle1.id,
      organizationId: org.id,
      createdBy: adminUser.id,
    },
  });

  console.log("✅ 3 expenses created");

  // ─── Settings ────────────────────────────────────────────────────
  await prisma.settings.createMany({
    data: [
      {
        organizationId: org.id,
        key: "notifications.email",
        value: true,
      },
      {
        organizationId: org.id,
        key: "notifications.sms",
        value: false,
      },
      {
        organizationId: org.id,
        key: "maintenance.alertDaysBefore",
        value: 7,
      },
      {
        organizationId: org.id,
        key: "trip.maxDailyHours",
        value: 10,
      },
    ],
  });

  console.log("✅ 4 settings created");

  // ─── Summary ─────────────────────────────────────────────────────
  console.log("\n🎉 Seed completed successfully!");
  console.log("─".repeat(40));
  console.log("📧 Admin login:   admin@transitops.com / Admin@123");
  console.log("📧 Manager login: manager@transitops.com / Manager@123");
  console.log("📧 Driver login:  raj.patel@transitops.com / Driver@123");
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
