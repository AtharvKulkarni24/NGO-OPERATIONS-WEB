export const formatWorker = (worker) => ({
  id: worker.id,
  firstname: worker.firstname,
  lastname: worker.lastname,
  email: worker.email,
  phone: worker.phone,
  role: worker.role,
  department: worker.department,
  status: worker.status,
  profilePictureUrl: worker.profilePictureUrl,
  skills: worker.skills,
  createdAt: worker.createdAt?.toISOString(),
  updatedAt: worker.updatedAt?.toISOString(),
  lastLogin: worker.lastLogin?.toISOString(),
});

export const formatWorkerList = (workers) => workers.map(formatWorker);

export const formatWorkerSecure = (worker) => {
  const formatted = formatWorker(worker);
  delete formatted.passwordHash;
  return formatted;
};

export const formatWorkerListSecure = (workers) =>
  workers.map(formatWorkerSecure);
