import { Deserializable } from "./deserializable";
import { TempDeserializableIdGenerator } from "./temp-deserializable-id-generator";


/**
 * Purse static class containing App Wide deseriables records used during deserialization.
 */
export class DeserializableRegistry {

    private static _tempDeserializationIdGen: TempDeserializableIdGenerator = new TempDeserializableIdGenerator();
    private static _deserializables: Map <string, Deserializable> = new Map <string, Deserializable>();

    
    /**
     * Private constructor due to pure static nature of class.
     */
    private constructor() {}


    public static registerDeserializableClass(ClassConstructor: Function, deserializableId: string): void {

        /* Since class member decorators are evaluated first, we may have initialized and registered this class's deserializable data on class member decorator evaluation.
         * In this case, the deserializable is registered under a temporary ID which is a member of the given ClassConstructor's prototype.
         * We must update the deserializable ID in the register and the ClassConstructor's prototype to the permanent one (deserailizableId argument above).
         * 
         * NOTE: The above is only the case when the registration ID is a temporary one (has a temp format). If not, then the registration ID is likely from a parent
         *       class and was inherited somewhere along the prototype chain. In this case, we simply register it like normal rather than update.
         */
        if (DeserializableRegistry.isDeserializableRegistred(ClassConstructor) && DeserializableRegistry.isDeserializableTempRegistered(ClassConstructor)) {
            DeserializableRegistry.updateDeserializableRegistrationId(ClassConstructor, deserializableId);
        }
        else {
            DeserializableRegistry.registerDeserializable(ClassConstructor, deserializableId);
        }
    }


    public static requireDeserializableMember(ClassConstructor: Function, memberName: string): void {

        // See setDeserializableMemberDeep to determine why registration is performed in methods associated with class member decorators.
        let deserializable: Deserializable = DeserializableRegistry.tempRegisterDeserializableIfNotExists(ClassConstructor);
        deserializable.setMemberRequired(memberName);
    }


    public static setDeserializableMemberDeep(ClassConstructor: Function, PropertyConstructor: Function, propertyName: string): void {

        /*
         * Class member decorators run before class decorators, so we will need to register the deserializable class under a temporary ID for now.
         * When the class decorator finally runs, then it will update the deserializableId (key) associated with the Deserializable Registration.
         */
        let deserializable: Deserializable = DeserializableRegistry.tempRegisterDeserializableIfNotExists(ClassConstructor);
        deserializable.setMemberDeepDeserializable(propertyName, PropertyConstructor);
    }


    public static skipDeserializableMember(ClassConstructor: Function, memberName: string): void {

        // See setDeserializableMemberDeep to determine why registration is performed in methods associated with class member decorators.
        let deserializable: Deserializable = DeserializableRegistry.tempRegisterDeserializableIfNotExists(ClassConstructor);
        deserializable.setMemberSkipped(memberName);
    }


    public static getAllRegisteredDesrializableIdsStr(): string {

        const deserializableIds: string[] = Array.from(DeserializableRegistry._deserializables.keys());
        let deserializableIdsStr: string = '';

        for (let i: number = 0; i < deserializableIds.length; i++) {
            deserializableIdsStr += ( deserializableIds[i] + (i === deserializableIds.length - 1 ? '' : ', ') );
        }

        return deserializableIdsStr;
    }


    /**
     * Gets a registered deserializable associated with a deserializable class.
     * @param instanceOrPrototype The instance or prototype of the deserlializable class.
     *                            NOTE: should contain the deserializableId that the deserializable is registered under.
     * The registered deserializable.
     */
    public static getDeserializable(instanceOrPrototype: any): Deserializable {
        
        // Grab the deserializable class wrapper so we can add deserializable properties to it.
        const deserializableId: string = instanceOrPrototype.deserializableId;
        return DeserializableRegistry._deserializables.get(deserializableId);
    }


    /**
     * Registers a Deserializable Class with the DeserializableRegistry if it does not already exist (has not been registered yet).
     * Uses an auto-generated temporary ID.
     * NOTE: This should NOT be called by the deserializable() annotation function and the auto generated ID should eventually be updated by deserializable() class annotation!
     * @param ClassConstructor The constructor of the class to be deserialized.
     * @param deserializableId The ID of that the deserializable should be registered under.
     * @return The registered deserializable (either registered in this method call or previously).
     */
    private static tempRegisterDeserializableIfNotExists(ClassConstructor: Function): Deserializable {

        // IMPORTANT: We must check if the Deseriable ID is a temporary one in order to not register it under a temporary ID.
        if (!DeserializableRegistry.isDeserializableTempRegistered(ClassConstructor)) {
            DeserializableRegistry.registerDeserializable(ClassConstructor, DeserializableRegistry._tempDeserializationIdGen.generateTempId());
        }

        return DeserializableRegistry.getDeserializable(ClassConstructor.prototype);
    }


    /**
     * Registers a Deserializable Class with the DeserializableRegistry so that it can automatically be deserialized given that it has a deserializableId set (via prototype).
     * @param ClassConstructor The constructor of the class to be deserialized.
     * @param deserializableId The ID of that the deserializable should be registered under.
     * @return The registered desrializable.
     */
    private static registerDeserializable(ClassConstructor: Function, deserializableId: string): Deserializable {

        // Ensure we are given a unique ID for the Deserializable.
        if (DeserializableRegistry._deserializables.has(deserializableId)) {
            throw new Error('Attempting to register a Deserializable with a repeat Deserializable ID.');
        }

        ClassConstructor.prototype.deserializableId = deserializableId;
        // IMPORTANT: We must include the deserializableId in JSON object via toJSON overload for automatic (non-explicit type) desrialization to work!
        ClassConstructor.prototype.toJSON = DeserializableRegistry.genDeserializableToJSONOverlaod(ClassConstructor.prototype.toJSON);

        console.log('Adding deserializable with ID \'' + deserializableId + '\' to the Deserializable Registry');
        DeserializableRegistry._deserializables.set(deserializableId, new Deserializable(ClassConstructor));
        //console.log('All deserializable IDs thus far: [ ' + DeserializableRegistry.getAllRegisteredDesrializableIdsStr() + ' ]');

        return DeserializableRegistry.getDeserializable(ClassConstructor.prototype);
    }


    /**
     * Generates an Deserializable version of the toJSON() method for the associated Deserializable Class. The generated method will be an overlaod of any
     * pre-existing toJSON() method. If none exists, then it simply becomes the toJSON() method with default toJSON() behavior.
     * @param baseToJSON The base toJSON() method that was present on the prototype before overloading it with deserializable toJSON() method.
     *                   NOTE: This can be null/undefined if not such method was explicitly defined by Deserializable Class or any of its super classes!
     * @return The generated toJSON() overload method.
     */
    private static genDeserializableToJSONOverlaod(baseToJSON: Function): any {

        return function() {

            let jsonObj: any = {};

            // If no base toJSON() method pre-existed on the prototype chain, then perform default toJSON funcitonality for serialization.
            if (baseToJSON == null) {

                for (let property in this) {
                    if (typeof this[property] !== 'function' && this.hasOwnProperty(property)) {
                        jsonObj[property] = this[property];
                    }
                }
            }
            // Else if we did have a base toJSON() method on prototype chain, then invoke it so we have overload behavior.
            else {
                jsonObj = baseToJSON.call(this);
            }

            // Add deserializableId to JSON object from object's prototype (so we can automatically deserialize without explicit type/constructor after parsing JSON).
            jsonObj.deserializableId = this.deserializableId;
            return jsonObj;
        }
    }


    /**
     * Updates the ID of a given registered Deserialization Class.
     * NOTE: Should be used to change a temp Deserialization ID to the final Deserialization ID passed to the deserializable() class annotation function.
     * @param ClassConstructor The constructor of the registered class that we are updating the ID for.
     * @param newDeserializableId The new ID for the deserialization class registration.
     */
    private static updateDeserializableRegistrationId(ClassConstructor: Function, newDeserializableId: string): void {

        if (DeserializableRegistry._deserializables.has(newDeserializableId)) {
            throw new Error('Attempting to update Deserializable ID to one that already exists.');
        }

        // Grab old ID, and replace old ID on prototype with new ID.
        const oldDeserializableId: string = ClassConstructor.prototype.deserializableId;
        ClassConstructor.prototype.deserializableId = newDeserializableId;

        // Change the registration mapping to use the new ID.
        console.log('Updating deserializable with ID \'' + oldDeserializableId + '\' to have new ID: \`' + newDeserializableId + '\'');
        DeserializableRegistry._deserializables.set(newDeserializableId, DeserializableRegistry._deserializables.get(oldDeserializableId));
        DeserializableRegistry._deserializables.delete(oldDeserializableId);
        //console.log('All deserializable IDs thus far: [ ' + DeserializableRegistry.getAllRegisteredDesrializableIdsStr() + ' ]');
    }


    /**
     * Checks to see if a Deserializable Class has been registered with the DeserializableRegistry.
     * @param ClassConstructor The constructor of the Deserializable Class.
     * @return true if it has been registered, false if not.
     */
    public static isDeserializableRegistred(ClassConstructor: Function): boolean {
        return ( ClassConstructor.prototype.deserializableId != null );
    }


    /**
     * Checks to see if a Deserializable Class has been temporarily registered with the DeserializableRegistry.
     * NOTE: For a Deserializable to be temporarily registered, it must have decorator functions on its class members that have been invoked
     *       and a class decorator that hasn't yet been invoked.
     * @param ClassConstructor The constructor of the Deserializable Class.
     * @return true if it has been temporarily registered, false if not.
     */
    private static isDeserializableTempRegistered(ClassConstructor: Function): boolean {
        return ( DeserializableRegistry._tempDeserializationIdGen.isTempId(ClassConstructor.prototype.deserializableId) );
    }
}
