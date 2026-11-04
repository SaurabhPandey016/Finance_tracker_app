import type { Response } from "express";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

export const successResponse = <T>(res: Response, statusCode: number, message: string, data?: T) =>
  res.status(statusCode).json({ success: true, message, ...(data === undefined ? {} : { data }) });

export const errorResponse = (res: Response, statusCode: number, message: string, errors?: unknown) =>
  res.status(statusCode).json({ success: false, message, ...(errors === undefined ? {} : { errors }) });
