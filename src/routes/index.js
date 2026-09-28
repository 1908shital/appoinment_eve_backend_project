const express = require("express");

const userRoutes = require("./user.routes");
const diagnosticCenterRoutes = require("./diagnosticCenter.routes");
const testRoutes = require("./test.routes");
const centerTestRoutes = require("./centerTest.routes");
const slotRoutes = require("./slot.routes");
const bookingRoutes = require("./booking.routes");
const paymentRoutes = require("./payment.routes");

const router = express.Router();

router.use("/users", userRoutes);
router.use("/diagnostic-centers", diagnosticCenterRoutes);
router.use("/tests", testRoutes);
router.use("/center-tests", centerTestRoutes);
router.use("/slots", slotRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);

module.exports = router;