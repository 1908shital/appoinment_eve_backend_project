export const formatDate = (dateObj) => {
  const d = new Date(dateObj);
  return d.toISOString().split("T")[0];
};

export const formatTime = (dateObj) => {
  const d = new Date(dateObj);
  const hours = d.getUTCHours();
  const minutes = d.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const getSlotLockKeyDetailed = (slotId, dateStr, timeStr, centerId, testId) => {
  return `lock:${slotId}:${dateStr}:${timeStr}:${centerId}:${testId}`;
};

export const getSlotLockKeyBasic = (slotId, dateStr, timeStr) => {
  return `lock:${slotId}:${dateStr}:${timeStr}`;
};

export const getSlotByTestKey = (testIdentifier, dateStr, startTimeStr) => {
  const testClean = String(testIdentifier).replace(/\s+/g, "_");
  return `slot:${testClean}:${dateStr}:${startTimeStr}`;
};

export const getSlotByCenterKey = (centerIdentifier, dateStr, startTimeStr) => {
  const centerClean = String(centerIdentifier).replace(/\s+/g, "_");
  return `slot:${centerClean}:${dateStr}:${startTimeStr}`;
};

export const getSlotLockKey = (slotId) => {
  return `slot_lock:${slotId}`;
};

