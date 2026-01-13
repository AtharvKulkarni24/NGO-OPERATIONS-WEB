export const formatAttendanceRecord = (data) => {
  const record = data.attendance || data;
  const worker = data.worker || null;

  return {
    id: record.id,
    workerId: record.workerId,
    workerName: worker ? `${worker.firstname} ${worker.lastname}` : undefined,
    workerEmail: worker ? worker.email : undefined,
    projectId: record.projectId,
    shiftId: record.shiftId,
    checkInAt: record.checkInAt?.toISOString(),
    checkOutAt: record.checkOutAt?.toISOString(),
    checkInLocation:
      record.checkInLat && record.checkInLng
        ? {
            lat: record.checkInLat,
            lng: record.checkInLng,
          }
        : null,
    checkOutLocation:
      record.checkOutLat && record.checkOutLng
        ? {
            lat: record.checkOutLat,
            lng: record.checkOutLng,
          }
        : null,
    method: record.method,
    status: record.status,
    workingHours: record.workingHours,
    date: record.date ? new Date(record.date).toISOString().split('T')[0] : null,
    createdAt: record.createdAt?.toISOString(),
  };
};

export const formatAttendanceList = (records) =>
  records.map(formatAttendanceRecord);
