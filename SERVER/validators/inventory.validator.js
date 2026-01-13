import { z } from "zod";

export const inventorySchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  itemName: z.string().min(1, "Item name required"),
  category: z.string().optional(),
  quantityAvailable: z.number().int().min(0),
  unit: z.string().optional(),
  location: z.string().optional(),
});

export const logSchema = z.object({
  inventoryId: z.string().uuid("Invalid inventory ID"),
  changeQty: z.number().int(),
  reason: z.string().optional(),
});
