/**
 * Contains static utility methods for enum manipulation.
 */
export class EnumManipulation {

    // Pure static class.
    private constructor() {}


    /**
     * Gets the values of an enum from its instance.
     * @param enumInstance The enum instance to get the values of.
     * @return An array of the enum values.
     */
    public static getEnumValues(enumInstance: any): any[] {

        let enumValues: any[] = [];

        for (let enumKey in enumInstance) {
            if (!enumInstance.hasOwnProperty(enumKey) || !isNaN(Number(enumInstance[enumKey]))) continue;

            enumValues.push(enumInstance[enumKey]);
        }

        return enumValues;
    }
}
