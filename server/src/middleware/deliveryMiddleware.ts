import type { Request, Response, NextFunction } from "express";
import Jwt, { type JwtPayload } from "jsonwebtoken";

export async function deliveryMiddleware(req: Request, _: Response, next: NextFunction) {
    const authorization = req.headers.authorization
    const token = authorization?.split(" ")[1] as string

    const decoded = Jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    if (decoded && decoded.role !== "delivery") {
        throw Error("Invalid request")
    }

    next();
}
