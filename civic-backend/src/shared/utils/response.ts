import { Response } from "express";

export const ok = (res: Response, data: any = null, meta: any = null, status = 200): Response => {
  return res.status(status).json({
    success: true,
    data,
    meta,
  });
};

export const created = (res: Response, data: any = null, meta: any = null): Response => {
  return ok(res, data, meta, 201);
};

export const list = (res: Response, items: any[], meta: any = null): Response => {
  return ok(res, items, meta, 200);
};

export default { ok, created, list };
