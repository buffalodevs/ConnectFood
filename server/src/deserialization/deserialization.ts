import { Request, Response, NextFunction } from "express";
import { Deserializer } from "../../../shared/src/deserialization/deserializer";

// Necessary to prevent tree shaking from removing deserializable registration via class decorators (ensures modules are loaded).
import '../../../shared/src/deserialization/deserializable-import-bundle';


export const DESERIALIZER: Deserializer = new Deserializer();


/**
 * Middleware function that deserializes all incoming messages' bodies (payloads) that are registered deserializable objects.
 * @param request The incoming request message.
 * @param response The response to send back to the client.
 * @param next Callback function that transfers control to the next route handler.
 */
export function deserialize(request: Request, response: Response, next: NextFunction): void {

    request = attemptDeserializeAddFoodListing(request);

    // If we have a message body (payload data) that is a registered deserializable object, then deserialize it.
    if (request.body != null && DESERIALIZER.isRegisteredDeserializable(request.body)) {
        request.body = DESERIALIZER.deserialize(request.body);
    }

    next(); // Call the next route handler.
}


/**
 * If we are receiving a multipart/form-data request for addFoodListing, then we must do extra work after multer pre-processes request for us.
 * multer will add a files array that contains all of our image file attachments. It will also generate the body of the request, which will contain the
 * JSON serialized/stringified form data in a dataJSON member. We must completely deserialize this, then set it to the body.
 * @param request The request to possibly do special deserialization for (if it is addFoodListingRequest with image file attachments).
 * @return The deserialized request.
 */
function attemptDeserializeAddFoodListing(request: Request): Request {

    
    const isAddFoodListingReqWithImgs: boolean = ( request.url.indexOf('addFoodListing') >= 0 && request.headers['content-type'].indexOf('multipart/form-data') >= 0 );
    
    if (isAddFoodListingReqWithImgs) {
        request.body = JSON.parse(request.body['dataJSON']);
    }

    return request;
}
