import { Response } from "express";

export const sendResponse = (
  res: Response,
  statusCode: number,
  payload: {
    success?: boolean;
    message?: string;
    data?: any;
    error?: any;
  }
) => {
  return res.status(statusCode).json({
    success: payload.success ?? true,
    message: payload.message,
    data: payload.data ?? null,
    error: payload.error ?? null,
  });
};
