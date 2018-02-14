import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Deserializer } from '../../../../../shared/src/deserialization/deserializer';
import { DeserializableRegistry } from '../../../../../shared/src/deserialization/deserializable-registration/deserializable-registry';

// IMPORTANT: Ensures that tree shaking will not remove imports where deserializable decorators must be invoked for deserializable registration.
import '../../../../../shared/src/deserialization/deserializable-import-bundle';


@Injectable()
export class DeserializerService {

    private static readonly _DESERIALIZER: Deserializer = new Deserializer();


    public constructor(
        _logger: NGXLogger
    ) {
        _logger.debug('Registered Deserializables: ' + DeserializableRegistry.getAllRegisteredDesrializableIdsStr());
    }


    /**
     * Deserializes a given target (response) object if it is an instance of a registered deserializable class.
     * @param target the target object of the deserialization.
     */
    public deserialize(target: any): any {

        if (target != null && DeserializerService._DESERIALIZER.isRegisteredDeserializable(target)) {
            return DeserializerService._DESERIALIZER.deserialize(target);
        }

        return target;
    }
}
