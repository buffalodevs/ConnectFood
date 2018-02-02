export class TempDeserializableIdGenerator {

    private readonly _TEMP_ID_PREFIX: string;
    private _tempDeserializableId: number;


    public constructor() {
        this._TEMP_ID_PREFIX = '`';
        this._tempDeserializableId = 0;
    }


    /**
     * Generates a new (unique) temporary deserializable ID.
     * @return The new ID.
     */
    public generateTempId(): string {
        return ( this._TEMP_ID_PREFIX + (this._tempDeserializableId++).toString() );
    }


    /**
     * Checks if a given Deserialization ID is a temporary ID.
     * @param deserializationId The ID to check.
     * @return true if it is, false if not.
     */
    public isTempId(deserializableId: string): boolean {
        return (deserializableId != null) ? ( deserializableId.indexOf(this._TEMP_ID_PREFIX) === 0 )
                                          : false;
    }
}
