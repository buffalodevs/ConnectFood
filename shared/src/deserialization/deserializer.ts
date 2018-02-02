import * as moment from "moment";
import { Deserializable } from "./deserializable-registration/deserializable";
import { DeserializableRegistry } from "./deserializable-registration/deserializable-registry";

export { deserializable, requireDeserializable, deepDeserializable, skipDeserializable } from './deserializable-registration/deserializable-annotations';


/**
 * Drives custom deserialization of objects that have gone through a JSON.stringify() and JSON.parse() transition.
 * In its generic form, deserialization will add all properties (such as methods) that have been stripped form an object when converted to and from JSON back onto the object.
 * NOTE: Only objects that use deserializable() class decorator will be targeted by this Deserializer.
 */
export class Deserializer {

    public constructor() {}


    /**
     * Checks if a given object's class is a registered Deserializable Class.
     * @param obj The object to check.
     * @return true if it is, false if not.
     */
    public isRegisteredDeserializable(obj: any): boolean {
        return ( obj.deserializableId != null );
    }


    /**
     * Attempts to perform custom serialization of a given target (object or iterable collection).
     * NOTE: Only targets that use deserializable() class decorator will be deserialized.
     * @param target The target (object or iterable collection) of the deserialization.
     *               NOTE: May be INTERNALLY MODIFIED.
     * @param TargetConstructor The contructor of the target object. Not needed if its deserializableId member
     *                          (which was implicitly assigned via @deserializable() annotation) is still in-tact.
     * @return The deserialized target. If the deserialized target itself was deserialized (and not it members), such as in the case of string -> date,
     *         then its new value will need to overwrite its old value within the object that it is a member of.
     */
    public deserialize(target: any, TargetConstructor?: Function, throwErrOnNoDeserializeId: boolean = false): any {

        // Ignore any null/undefined targets (jump out immediately).
        if (target == null) return target;

        // Derive constructor function (or type) for deserialization.
        TargetConstructor = this.deriveTargetConstructor(target, TargetConstructor, throwErrOnNoDeserializeId);
        if (TargetConstructor === null) return target; // If we cannot derive TargetConstructor (type), then jump out.

        // If we are targeting an array, then we will attempt to deserialize each of its members.
        if (Array.isArray(target)) {
            this.deserializeArrayMembers(target, TargetConstructor);
        }
        // Else, if we are performing automatic date deserialization on ISO strings.
        else if (TargetConstructor === Date && typeof target === 'string') {
            target = this.attemptDeserializeStrToDate(target);
        }
        // Else, we are targeting an object, so attempt to directly deserialize it.
        else {
            this.deserializeObject(target, TargetConstructor, throwErrOnNoDeserializeId);
        }

        return target;
    }


    /**
     * Derives the class for a given target object. If the given target class (originally from Deserializer client) is not empty, then it is used.
     * If it is empty, then it is derived from the deserializableId member of the target object (inherited from Deserializable).
     * @param target The target object to derive the target class for.
     * @param TargetConstructor The target constructor argument provided by client using Deserializer (may be null).
     * @return The derived target class.
     */
    private deriveTargetConstructor(target: any, TargetConstructor: Function, throwErrOnNoDeserializeId: boolean): Function {

        // If not explicitely provided with the ObjClass, then we must derive it from Deserializable deserializableId member.
        if (TargetConstructor == null) {

            if (target.deserializableId == null) {

                if (throwErrOnNoDeserializeId) {
                    throw new Error(`Could not properly derive target deserialization object type since given object does not have deserializableId member
                                    NOTE: You must explictly provide the Deserializable ID of the object as an argument to the deserializable() class decorator.`);
                }
                else {
                    return null;
                }
            }

            TargetConstructor = DeserializableRegistry.getDeserializable(target).ClassConstructor;

            if (TargetConstructor == null) {
                throw new Error('Could not find a registered deserializable with deserializable ID: ' + target.deserializableId + `
                                 NOTE: Did you forget to call Deserializer.registerDeserializable(deserializableId)?`);
            }
        }

        return TargetConstructor;
    }


    /**
     * Attempts to deserialize the members of a given array.
     * @param arr The array to deserialize the members of.
     * @param ElementClass The class of the elements of the array.
     */
    private deserializeArrayMembers(arr: any[], ElementClass: Function): void {

        for (let i: number = 0; i < arr.length; i++) {
            arr[i] = this.deserialize(arr[i], ElementClass);
        }
    }


    /**
     * Checks to see if a given string is in ISO_8601 format, and if it is, then it converts it to a Date object.
     * @param str The string that is to be potentially converted to a Date object.
     * @return The converted Date object if the sting was convertable to a Date object. Otherwise, the original string.
     */
    private attemptDeserializeStrToDate(str: string): Date | string {

        let deserializeResult: Date | string = str;
        const targetMoment: moment.Moment = moment(str, moment.ISO_8601, true);

        // If we are targeting a valid ISO_8601 string, then transform it into a date.
        if (targetMoment.isValid()) {
            deserializeResult = targetMoment.toDate();
        }
        else {
            throw new Error('When attempting to deserialize Date field, given string not convertable to Date object: ' + str);
        }

        return deserializeResult;
    }


    /**
     * Attempts to deserialize an object. If the object has properties that are also objects or iterable collections, then those will be recursively deserialized as well.
     * This is known as shallow object deserialization (which is default deserialization of members of deserializable class).
     * @param obj The object to deserialize.
     * @param ObjConstructor The class constructor of the object to be deserialized.
     */
    private deserializeObject(obj: any, ObjConstructor: Function, throwErrOnNoDeserializeId: boolean): void {

        const ObjPrototype: object = ObjConstructor.prototype;
        const objDeserializable: Deserializable = DeserializableRegistry.getDeserializable(ObjPrototype); // NOTE: Can be null/undefined if obj's class not registered.

        // Shallow member deserialization: If our object that we are deserializing is missing a property/function from its prototype, then add it.
        this.shallowDeserializeObj(obj, objDeserializable, ObjPrototype);

        // Determine which members of the deserializable object will be deep (recursively have its members) deserialized.
        if (objDeserializable != null) {
            this.deepDeserializeObjMembers(objDeserializable, obj);
        }
    }


    /**
     * Performs shallow deserialization of an object's members. This basically ensures that all members in orignal object prototype
     * are part of the deserialized object (Such as when re-adding methods after JSON transition).
     * @param obj An instance of the object that is having its member shallow deserialized.
     * @param objDeserializable The deserilizable metadata for the object that is having its member shallow deserialized.
     * @param ObjPrototype The prototype of the object that is having its member shallow deserialized.
     */
    private shallowDeserializeObj(obj: any, objDeserializable: Deserializable, ObjPrototype: any): void {

        // First, check to ensure that all required members are defined.
        if (objDeserializable != null) {
            this.validateRequiredDeserializableMembers(obj, objDeserializable);
        }

        // Remove the Deserializable ID on this instance (it should be on prototype instead).
        delete obj.deserializableId;
        // Re-insert the prototype (which should re-add all missing porperties for the given deserialization object).
        obj.__proto__ = ObjPrototype;

        // Last, remove any members that have been annotated to be skipped.
        if (objDeserializable != null) {
            this.removeSkippedDeserializableMembers(obj, objDeserializable);
        }
    }


    /**
     * Validates that all required desrializable class members are present on the target object.
     * NOTE: Must be invoked before setting of prototype in shallow deserialization.
     * @param obj The target object.
     * @param objDeserializable The deserializable metatdata for the target object.
     */
    private validateRequiredDeserializableMembers(obj: any, objDeserializable: Deserializable): void {

        const requiredDeserializableMemberNames: string[] = objDeserializable.getRequiredDeserializableMemberNames();

        for (let i: number = 0; i < requiredDeserializableMemberNames.length; i++) {
            if (typeof obj[requiredDeserializableMemberNames[i]] === 'undefined') {
                throw new Error('Required deserializable class member is undefined: ' + requiredDeserializableMemberNames[i]);
            }
        }
    }


    /**
     * Removes all class members of a deserialized object that have been marked to be skipped.
     * NOTE: Must be invoked after setting of prototype in shallow deserialization.
     * @param obj The target object.
     * @param objDeserializable The deserializable metatdata for the target object.
     */
    private removeSkippedDeserializableMembers(obj: any, objDeserializable: Deserializable): void {

        const skippedDeserializableMemberNames: string[] = objDeserializable.getSkippedDeserializableMemberNames();

        for (let i: number = 0; i < skippedDeserializableMemberNames.length; i++) {
            delete obj[skippedDeserializableMemberNames[i]];
        }
    }


    /**
     * Recursively deserializes a given object's properties that have been annotated for deep deserialization.
     * @param objDeserializable The deserializable metadata for the object that we are attempting to deep (recursively) deserialize the members of.
     * @param obj The object to deserialize the annotated deep deserialization properties of.
     */
    private deepDeserializeObjMembers(objDeserializable: Deserializable, obj: Deserializable): void {

        const targetDeepMemberNames: string[] = objDeserializable.getDeepDeserializableMemberNames();

        for (let i: number = 0; i < targetDeepMemberNames.length; i++) {

            const deepDeserializableName: string = targetDeepMemberNames[i];
            const DeepDeserializableConstructor: Function = objDeserializable.getDeepDeserializableMemberConstructor(deepDeserializableName);

            if (obj[deepDeserializableName] != null) {
                obj[deepDeserializableName] = this.deserialize(obj[deepDeserializableName], DeepDeserializableConstructor);
            }
        }
    }
}
