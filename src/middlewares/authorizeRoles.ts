import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authMiddleware";
import { sendResponse } from "../core/response/apiResponse";
import { HttpStatusCode } from "../core/enums/httpStatusCode";

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      sendResponse(res,HttpStatusCode.FORBIDDEN,{
        success:false,
        message:"Bu işlemi yapmaya yetkiniz yok.",
      });
    }
    next();
  };
};
