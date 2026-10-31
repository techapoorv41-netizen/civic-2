const ok = (res, data, meta = null, status = 200) =>
  res.status(status).json({ success: true, data, meta });

const created = (res, data) => ok(res, data, null, 201);

const list = (res, data, meta) => ok(res, data, meta);

const fail = (res, status, code, message, details) =>
  res.status(status).json({ success: false, error: { code, message, details } });

module.exports = { ok, created, list, fail };