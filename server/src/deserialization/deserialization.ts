import { Request, Response, NextFunction } from "express";
import { Deserializer } from "../../../shared/src/deserialization/deserializer";


export const DESERIALIZER: Deserializer = new Deserializer();


/**
 * Middleware function that deserializes all incoming messages' bodies (payloads) that are registered deserializable objects.
 * @param request The incoming request message.
 * @param response The response to send back to the client.
 * @param next Callback function that transfers control to the next route handler.
 */
export function deserialize(request: Request, response: Response, next: NextFunction): void {

    // If we have a message body (payload data) that is a registered deserializable object, then deserialize it.
    if (request.body != null && DESERIALIZER.isRegisteredDeserializable(request.body)) {
        request.body = DESERIALIZER.deserialize(request.body);
    }

    next(); // Call the next route handler.
}
