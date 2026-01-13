import { eventsTable } from "../models/index.js";

export const createEvent = async (data) => {
  const event = await eventsTable.create(data);
  return [event];
};

export const getProjectEvents = (projectId) =>
  eventsTable.find({ projectId });

export const getEventById = async (id) => {
  const event = await eventsTable.findById(id);
  return event ? [event] : [];
};

export const updateEvent = async (id, data) => {
  const event = await eventsTable.findByIdAndUpdate(id, data, { new: true });
  return event ? [event] : [];
};

export const deleteEvent = (id) =>
  eventsTable.findByIdAndDelete(id);
