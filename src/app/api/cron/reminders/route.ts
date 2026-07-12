import { prisma } from "@/lib/prisma";
import { sendDriverExpiryReminder } from "@/lib/email";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isTest = searchParams.get("test") === "true";
  const testEmail = searchParams.get("email");

  try {
    // 1. Handle Test Mode
    if (isTest && testEmail) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await sendDriverExpiryReminder({
        name: "John Doe (Test)",
        email: testEmail,
        licenseNo: "DL-999-TEST-1234",
        licenseCategory: "HMV",
        licenseExpiry: tomorrow,
        contactNumber: "+91 99999 88888",
      });

      return Response.json({
        success: true,
        message: `Verification test reminder email sent to: ${testEmail}`,
      });
    }

    // 2. Standard Mode: Fetch drivers expiring tomorrow (in exactly 1 day)
    const tomorrowStart = new Date();
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date();
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const expiringDrivers = await prisma.driver.findMany({
      where: {
        licenseExpiry: {
          gte: tomorrowStart,
          lte: tomorrowEnd,
        },
      },
    });

    const results = [];
    for (const driver of expiringDrivers) {
      try {
        await sendDriverExpiryReminder(driver);
        results.push({
          id: driver.id,
          name: driver.name,
          email: driver.email,
          status: "success",
        });
      } catch (err) {
        logger.error(`Failed to send reminder email to ${driver.email}`, { error: err });
        results.push({
          id: driver.id,
          name: driver.name,
          email: driver.email,
          status: "failed",
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return Response.json({
      success: true,
      processedAt: new Date().toISOString(),
      checkedRange: {
        start: tomorrowStart.toISOString(),
        end: tomorrowEnd.toISOString(),
      },
      expiringDriversFound: expiringDrivers.length,
      results,
    });
  } catch (error) {
    logger.error("Reminder check failed", { error });
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
