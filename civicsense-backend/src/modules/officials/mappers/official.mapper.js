const toOfficialDto = (p) => {
  const u = p.userId && p.userId.name ? p.userId : null;
  return {
    id: String(p._id),
    userId: String(u ? u._id : p.userId),
    user: u ? { id: String(u._id), name: u.name, email: u.email, phone: u.phone } : undefined,
    department: p.department,
    designation: p.designation,
    employeeId: p.employeeId,
    area: p.area,
    isVerified: p.isVerified,
    verifiedAt: p.verifiedAt || null,
    createdAt: p.createdAt,
  };
};

module.exports = { toOfficialDto };