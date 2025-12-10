export const getMonthRange = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
  const end = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  return { start: normalizeStart(start), end: normalizeEnd(end) };
};

function normalizeStart(d: Date) {
  const dt = new Date(d);
  dt.setUTCHours(0, 0, 0, 0);
  return dt;
}

function normalizeEnd(d: Date) {
  const dt = new Date(d);
  dt.setUTCHours(23, 59, 59, 999);
  return dt;
}
