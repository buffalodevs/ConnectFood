export class ArrayManipulation {

    // Pure static class.
    private constructor() {}


    /**
     * Checks if a given object is an array.
     * @param arr Object to be checked if it is an array.
     * true if it is an array, false if not.
     */
    public static isArray(arr: any): boolean {
        
        return (Array.isArray) ? Array.isArray(arr)
                               : arr instanceof Array;
    }
}
