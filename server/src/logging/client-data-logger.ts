import { Request, Response } from "express";
import { logger } from "./logger";


/**
 * Handles the logging of data from the client.
 * NOTE: We should only be getting 'warn' and 'error' level data from the client here.
 * @param request The log client data request.
 * @param response The log client data resposne.
 */
export function handleLogClientData(request: Request, response: Response): void {

    const level: string = request.body.level.toLowerCase();
    const message: string = request.body.message;

    logger.log(level, message);
    response.end();
}
