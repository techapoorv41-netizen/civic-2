const idOf = (v) => (v && v._id ? String(v._id) : v ? String(v) : null);

const toIssueDto = (i) => ({
  id: String(i._id || i.id),
  title: i.title,
  description: i.description,
  status: i.status,
  priority: i.priority,
  location: i.location && {
    address: i.location.address,
    lat: i.location.lat,
    lng: i.location.lng,
  },
  category: i.categoryId && i.categoryId.name ? { id: idOf(i.categoryId), name: i.categoryId.name } : idOf(i.categoryId),
  reporter: i.reporterId && i.reporterId.name ? { id: idOf(i.reporterId), name: i.reporterId.name } : idOf(i.reporterId),
  assignedOfficial:
    i.assignedOfficialId && i.assignedOfficialId.name
      ? { id: idOf(i.assignedOfficialId), name: i.assignedOfficialId.name }
      : null,
  assignedOfficialId: idOf(i.assignedOfficialId),
  remarks: i.remarks || null,
  verifiedAt: i.verifiedAt || null,
  resolvedAt: i.resolvedAt || null,
  createdAt: i.createdAt,
  updatedAt: i.updatedAt,
});

const toHistoryDto = (h) => ({
  id: String(h._id || h.id),
  previousStatus: h.previousStatus,
  newStatus: h.newStatus,
  actor: h.actorId && h.actorId.name ? { id: idOf(h.actorId), name: h.actorId.name, role: h.actorId.role } : idOf(h.actorId),
  remarks: h.remarks || null,
  createdAt: h.createdAt,
});

module.exports = { toIssueDto, toHistoryDto };