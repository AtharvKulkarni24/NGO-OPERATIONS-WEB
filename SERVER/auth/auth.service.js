import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { workersTable } from "../models/index.js";

export const hashPassword = (password) => bcrypt.hash(password, 10);

export const verifyPassword = (password, hash) =>
  bcrypt.compare(password, hash ?? "");

export const signWorkerToken = (worker) =>
  jwt.sign(
    {
      sub: worker.id,
      email: worker.email,
      firstname: worker.firstname,
      lastname: worker.lastname,
      role: worker.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

export const createWorker = async (values) => {
  const worker = await workersTable.create(values);
  return [worker];
};

export const findWorkerByEmail = async (email) => {
  const workers = await workersTable.find({ email });
  return workers;
};
