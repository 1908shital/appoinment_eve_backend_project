import "dotenv/config";
import express from "express";
import cors from "cors";

// Import all route modules directly
import userRoutes from "./routes/user.routes.js";
import diagnosticCenterRoutes from "./routes/diagnosticCenter.routes.js";
import testRoutes from "./routes/test.routes.js";
import centerTestRoutes from "./routes/centerTest.routes.js";
import slotRoutes from "./routes/slot.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import { initSlotCronJob } from "./jobs/slotCron.job.js";

const app = express();

// Initialize nightly 03:30 AM IST slot generation cron job
initSlotCronJob();

// Global Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Diagnostic Booking Backend Service is running smoothly",
  });
});

// Register API Routes
app.use("/api/users", userRoutes);
app.use("/api/diagnostic-centers", diagnosticCenterRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/center-tests", centerTestRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);

// Global 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Server Error]", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Diagnostic Booking Server running on port ${PORT}`);
});

export default app;