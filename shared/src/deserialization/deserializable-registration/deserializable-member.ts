/**
 * Container for qualities concerning deserializable (class) members.
 */
export class DeserializableMember {

    public constructor (
        /**
         * The name of the deserializable class member/property.
         */
        public readonly memberName: string,
        /**
         * A required member must NOT be undefined. If it is undefined, then it will result in an error.
         */
        public isRequired: boolean = false,
        /**
         * If this is non-null, then this member will be targeted by deep deserialization.
         * If the Constructor is that of a user defined object type, then its properties will all be (recursively) targeted by deserialization.
         * If the Constructor is that of a built in type (such as Date), then an implicit conversion will be attempted to
         * convert whatever value is present into that type (such as stirng -> Date object).
         *
         * NOTE: non-deep deserializable members are targeted by shallow deserialization. This means that they will be added to the object
         *       if they are missing (using the Constructor Prototype for the object), but no other action will take place.
         */
        public deepDeserializableConstructor: Function = null,
        /**
         * A skipped member will not be targeted by deserialization (both shallow and deep).
         */
        public isSkipped: boolean = false
    ) {}
}
