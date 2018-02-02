import { DeserializableMember } from "./deserializable-member";


/**
 * Encapsulates registration data for a registered deserializable class and all of its properties.
 */
export class Deserializable {


    /**
     * The members of the associated deserializable class that have special deserializable (decorator) attributes applied
     * will be mapped in this collection. The keys are the names of the members, and the values are the special attributes they have been given.
     * 
     * NOTE: A member does NOT need to be a member of this collection to be targeted by (basic) shallow deserialization.
     */
    private _deserializableMembers: Map <string, DeserializableMember>;
    private _requiredDeserializableMemberNames: string[];
    private _skippedDeserializableMemberNames: string[];
    private _deepDeserializableMemberNames: string[];


    public constructor (
        /**
         * The constructor Function (also can be though of as the Class or Type) of the property.
         */
        public ClassConstructor?: Function
    ) {
        this._deserializableMembers = new Map <string, DeserializableMember>();
        this._requiredDeserializableMemberNames = [];
        this._skippedDeserializableMemberNames = [];
        this._deepDeserializableMemberNames = [];
    }


    /**
     * Sets a given deserializable class member to be required.
     * See DeserializableMember's isRequired property for more details
     * @param memberName The name of the deserializable class member.
     */
    public setMemberRequired(memberName: string): void {

        this.initMemberIfNotExist(memberName);
        this._deserializableMembers.get(memberName).isRequired = true;
        this._requiredDeserializableMemberNames.push(memberName);
    }


    /**
     * Checks if a given deserializable class member is required.
     * See DeserializableMember's isRequired property for more details
     * @param memberName The name of the deserializable class member.
     */
    public isMemberRequired(memberName: string): boolean {
        return ( this._deserializableMembers.has(memberName) && this._deserializableMembers.get(memberName).isRequired );
    }


    /**
     * Gets all names of members that have been annotated to be required (NOT undefined).
     * @return An array of the required deserializable member names.
     */
    public getRequiredDeserializableMemberNames(): string[] {
        return this._requiredDeserializableMemberNames;
    }


    /**
     * Sets a given deserializable class member to be targeted by deep deserialization.
     * See DeserializableMember's deepDeserializableConstructor property for more details
     * @param memberName The name of the deserializable class member.
     * @param MemberConstructor The Constructor for the deserailizable class member.
     */
    public setMemberDeepDeserializable(memberName: string, MemberConstructor: Function): void {

        this.initMemberIfNotExist(memberName);
        this._deserializableMembers.get(memberName).deepDeserializableConstructor = MemberConstructor;
        this._deepDeserializableMemberNames.push(memberName);
    }


    /**
     * Checks if the given deserializable class member should be targed by deep deserialization.
     * See DeserializableMember's deepDeserializableConstructor property for more details.
     * @param memberName The name of the deserializable class member.
     */
    public isMemberDeepDeserializable(memberName: string): boolean {
        return ( this._deserializableMembers.has(memberName) && this._deserializableMembers.get(memberName).deepDeserializableConstructor != null );
    }


    /**
     * Gets the deserializable member's constructor if the given deserializable class member should be targed by deep deserialization.
     * See DeserializableMember's deepDeserializableConstructor property for more details.
     * @param memberName The name of the deserializable class member.
     * @return The constructor for the member if it should be targeted by deep deserialization. Otherwise, null is returned.
     */
    public getDeepDeserializableMemberConstructor(memberName: string): Function {
        return this._deserializableMembers.has(memberName) ? this._deserializableMembers.get(memberName).deepDeserializableConstructor
                                                           : null;
    }


    /**
     * Gets all names of members that have been annotated for deep deserialization.
     * @return An array of the deep deserializable member names.
     */
    public getDeepDeserializableMemberNames(): string[] {
        return this._deepDeserializableMemberNames;
    }


    /**
     * Sets a given deserializable class member to be skipped by the deserializer.
     * See DeserializableMember's isSkipped property for more details
     * @param memberName The name of the deserializable class member.
     */
    public setMemberSkipped(memberName: string): void {

        this.initMemberIfNotExist(memberName);
        this._deserializableMembers.get(memberName).isSkipped = true;
        this._skippedDeserializableMemberNames.push(memberName);
    }


    /**
     * Checks if the given deserializable class member is skipped by the deserializer.
     * See DeserializableMember's isSkipped property for more details.
     * @param memberName The name of the deserializable class member.
     */
    public isMemberSkipped(memberName: string): boolean {
        return ( this._deserializableMembers.has(memberName) && this._deserializableMembers.get(memberName).isSkipped );
    }


    /**
     * Gets all names of members that have been annotated to be skipped by the deserializer.
     * @return An array of the skipped deserializable member names.
     */
    public getSkippedDeserializableMemberNames(): string[] {
        return this._skippedDeserializableMemberNames;
    }


    /**
     * Initializes a deserializable member if it does not already exist.
     * @param memberName The name of the member to check and possibly initialize.
     */
    private initMemberIfNotExist(memberName: string): void {

        if (!this._deserializableMembers.has(memberName)) {
            this._deserializableMembers.set(memberName, new DeserializableMember(memberName));
        }
    }
}
