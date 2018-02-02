import { Injectable } from '@angular/core';
import { Deserializer } from '../../../../../shared/src/deserialization/deserializer';


@Injectable()
export class DeserializerService {

    private static readonly _DESERIALIZER: Deserializer = new Deserializer();


    public constructor() {}


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
