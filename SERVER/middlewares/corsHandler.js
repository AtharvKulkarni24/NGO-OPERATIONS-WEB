import cors from "cors";

export const corsHandler = cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:8081",
    "http://localhost:3000",
    "http://10.54.142.16:8080",
    "http://10.54.142.16:8081",
    "http://10.54.142.16:5173",
    "http://192.168.137.1:8080",
    "http://192.168.137.1:8081",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
});
