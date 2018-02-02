import { DeserializableRegistry } from "./deserializable-registry";


/**
 * Marks a class as deserializable and registers it within the Deserializable Register so that automatic deserialization can occur.
 * @param deserializableId The (registration) ID of the Deserializable Class. Must be a unique ID (can simply be class name). Cannot be null.
 * @return A function that has the default class decorator input parameters.
 */
export function deserializable(deserializableId: string): Function {

    return function (ClassConstructor: Function) {
        DeserializableRegistry.registerDeserializableClass(ClassConstructor, deserializableId);
    }
}


/**
 * Marks a class member as required. A required member must be present in the object that is being deserialized (cannot be undefined).
 * If it is determined to be missing (undefined) during deserialization, then an exception is thrown.
 * NOTE: A value of null for the member is acceptable.
 * @param ClassPrototype The prototype of the class that the property belongs to.
 * @param propertyName The name of the property.
 */
export function requireDeserializable(): (ClassPrototype: any, propertyName: string) => void {

    return function (ClassPrototype: any, propertyName: string) {
        DeserializableRegistry.requireDeserializableMember(ClassPrototype.constructor, propertyName);
    }
}


/**
 * Marks a class property as deep deserializable. A deep deserializable member will be recursively deserialized (its members will also be targeted by the deserializer).
 * By default, all class properties are only shallow deserialized (they are added to the object being deserialized if they are missing).
 * @param PropertyConstructor The constructor function (or type) of the property.
 * @return A function that has the default property decorator input paramenters.
 */
export function deepDeserializable(PropertyConstructor: Function): (ClassPrototype: any, propertyName: string) => void {

    return function (ClassPrototype: any, propertyName: string) {
        DeserializableRegistry.setDeserializableMemberDeep(ClassPrototype.constructor, PropertyConstructor, propertyName);
    }
}


/**
 * Marks a class member to be skipped by the deserializer. Skipped class members are not added (or removed if they were part of the serialized object) during deserialization.
 * @param ClassPrototype The prototype of the class that the member belongs to.
 * @param memberName The name of the class member.
 */
export function skipDeserializable(): (ClassPrototype: any, propertyName: string) => void {

    return function (ClassPrototype: any, memberName: string) {
        DeserializableRegistry.skipDeserializableMember(ClassPrototype.constructor, memberName);
    }
}
