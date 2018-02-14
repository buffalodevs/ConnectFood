/**
 * Pure static class that contains utility methods for object manipulation.
 */
export class ObjectManipulation {

    // Private since pure static class.
    private constructor() {

        // Polyfill for Object.keys.
        /*if (!Object.keys) {
            Object.keys = (obj: {}) => {

                let keys: string[] = [];

                for (let property in obj) {
                    if (obj.hasOwnProperty(property)) {
                        keys.push(property);
                    }
                }

                return keys;
            }
        }*/
    }


    /**
     * Performs a shallow copy of a given source object to a given destination object.
     * A shallow copy entails copying the direct members of an object (not any grandchild members or lower).
     * NOTE: The destination object is internally modified, and there is no return value!!!
     * @param src The source object to copy from.
     * @param dest The destination object to copy to (WILL BE INTERNALLY MODIFIED).
     * @param excludeProperties An optional list of property names to exclude in the copy.
     * @param propertyPresentBoth Set to false if properties can be copied from a destination object that are not present in the source object.
     *                            NOTE: By default, only properties with names that are present in both objects may be copied!
     */
    public static shallowCopy(src: any, dest: any, excludeProperties: string[] = [], propertyPresentBoth: boolean = true): void {

        if (excludeProperties == null)  excludeProperties = [];

        for (let property in src) {
            if (src.hasOwnProperty(property) && (!propertyPresentBoth || dest.hasOwnProperty(property)) && excludeProperties.indexOf(property) === -1) {
                dest[property] = src[property];
            }
        }
    }


    /**
     * Applies a given function to all properties that are members of a given object.
     * @param obj The object from which to get the properties (keys) from.
     * @param fn The function to apply to each property of obj.
     */
    public static applyToProperties(obj: any, fn: (property: string) => void): void {
        
        for (let property in obj) {
            if (obj.hasOwnProperty(property)) {
                fn(property);
            }
        }
    }
}
