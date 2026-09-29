import cron from "node-cron";
import { generateSlotsForNext7Days } from "../services/slot.service.js";

/**
 * Nightly Cron Job: Runs every night at 03:30 AM IST
 * Generates 1-hour availability slots from 10:00 AM to 06:00 PM IST for the next 7 days.
 */
export const initSlotCronJob = () => {
  console.log("[Cron Job] Initializing Nightly Slot Generator Cron (03:30 AM IST)...");

  cron.schedule(
    "30 3 * * *",
    async () => {
      console.log("[Cron Job] Executing Nightly Slot Generation at 03:30 AM IST...");
      try {
        await generateSlotsForNext7Days();
      } catch (error) {
        console.error("[Cron Job Error] Failed to generate slots:", error.message);
      }
    },
    {
      timezone: "Asia/Kolkata",
    }
  );
};
