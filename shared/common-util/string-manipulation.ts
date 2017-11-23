import { ArrayManipulation } from './array-manipulation';


/**
 * Pure static class that contains methods for string and array of string manipulation/analyzation.
 */
export class StringManipulation {


    /**
     * Checks if the input is a string literal or string object.
     * @param value The input to check.
     * @return true if the input is a string literal or string object, false if not.
     */
    public static isString(value: any): boolean {
        return ( typeof(value) === 'string' || value instanceof String );
    }


    /**
     * Checks if the type of a given value is a string array.
     * NOTE: Not 100% certainty b/c arrays in JavaScript can be mixed type (Best Effort)!
     * @param value The value to check the type of.
     */
    public static isStringArr(value: any): boolean {
        return ArrayManipulation.isArray(value) && (value.length === 0 || StringManipulation.isString(value[0]));
    }


    /**
     * Checks if the input is an instance of a RegExp object.
     * @param value The input to check.
     * @return true if the input is an instance of a RegExp object, false if not.
     */
    public static isRegExp(value: any): boolean {
        return ( value instanceof RegExp );
    }


    /**
     * Escapes a given string's special characters for literal use in a regular expression.
     * @param str The string that is to have its special characters escaped.
     * @return The escaped string, ready for literal use in a regular expression.
     */
    public static escapeRegExp(str: string): string {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }


    /**
     * Converts a string to a boolean. Also implicitly tests if the given str value is a boolean.
     * @param str The string (or possibly boolean) to convert to a boolean.
     * @return If the string contains 'true' (non-case sensitive), then return true. Otherwise return false.
     *         NOTE: If provided with a boolean, then return the input boolean.
     */
    public static strToBoolean(str: any): boolean {

        if (StringManipulation.isString(str)) {
            return (str.toLowerCase() === 'true'); 
        }

        // If not a string, then assume it is a boolean and return.
        return str;
    }


    /**
     * Checks for a given substring inside a full string.
     * @param fullStr The full string to check for subStr in.
     * @param subStr The substring to check for inside of fullStr.
     * @param caseSensitive Set to true if the check should be case sensitive. Default is false for insensitive.
     * @return true if the substring was found, false if not.
     */
    public static checkForSubstring(fullStr: string, subStr: string, caseSensitive: boolean = false) {
        return caseSensitive ? fullStr.includes(subStr)
                             : fullStr.toLowerCase().includes(subStr.toLowerCase());
    }


    public static limitedSplit(str: string, delim: string, limit: number, includeEmptyStr: boolean = false): string[] {

        let splits: string[] = [];

        let indexOfDelim: number = str.indexOf(delim);
        if (indexOfDelim < 0)  return (str.length > 0 || includeEmptyStr) ? [str]
                                                                          : [];

        let firstSplit: string = str.substr(0, indexOfDelim);
        let secondSplit: string = str.substr(indexOfDelim + delim.length);

        // Add first split to result and decrease limit.
        if (firstSplit.length > 0 || includeEmptyStr) {
            splits.push(firstSplit);
            limit--;
        }

        // We have reached result count limit so we must stop!
        if (limit <= 1 || secondSplit.length === 0) {
            if ((secondSplit.length > 0 || includeEmptyStr) && limit === 1) {
                splits.push(secondSplit);
            }
            return splits;
        }

        // If we get here, we have not reached result count limit, and we pass it the secondSplit to recursively break down.
        return splits.concat(StringManipulation.limitedSplit(secondSplit, delim, limit, includeEmptyStr));
    }


    /**
     * Generates a filtered array based off of a given input array that only contains elements with a given substring.
     * @param stringArr The array to filter.
     * @param subStr The substring to filter by.
     * @param caseSensitive Set to true if the filter should be case sensitive. Default is false.
     * @return The filtered array.
     */
    public static filterBySubstring(stringArr: string[], subStr: string, caseSensitive: boolean = false) {

        const matchStr: string = caseSensitive ? subStr
                                               : subStr.toLocaleLowerCase();

        return stringArr.filter(data =>
                                (caseSensitive ? data : data.toLowerCase()).includes(matchStr));
    }


    /**
     * Forms a reordered array so that the closest matches are at the beginning of the array.
     * @param stringArr The array to form the reordered array from.
     * @param compareStr The string to find the closest matches to.
     * @param caseSensitive Set to true if case sensitivity is accounted for. Default is false for ignore case.
     * @return An array where the closest matches are the first elements.
     *         All elements that completely don't match remain in the same order and are pushed to the end of the array.
     */
    public static sortByStringSimilarity(stringArr: string[], compareStr: string, caseSensitive: boolean = false): string[] {

        const matchStr: string = caseSensitive ? compareStr
                                               : compareStr.toLowerCase();
        const matchRegExp: RegExp = new RegExp('^' + this.escapeRegExp(matchStr));
        
        let firstCharsHardMatches: string[] = [];
        let anySubStrSoftMatches: string[] = [];
        
        // First find hard and soft matches and move them to temporary arrays.
        for (let i: number = 0; i < stringArr.length; i++) {

            const autoCompleteEntry: string = caseSensitive ? stringArr[i]
                                                            : stringArr[i].toLowerCase();

            // If we find a complete match of the first subset of characters.
            if (autoCompleteEntry.match(matchRegExp)) {
                firstCharsHardMatches.push(stringArr.splice(i--, 1)[0]);
            }
            // Else if we find a complete match of any subset of characters.
            else if (autoCompleteEntry.includes(matchStr)) {
                anySubStrSoftMatches.push(stringArr.splice(i--, 1)[0]);
            }
        }

        // Finally, return the reordered list!
        return firstCharsHardMatches.concat(anySubStrSoftMatches, stringArr);
    }


    /**
     * Checks to see if a given string is a substring of at least one string in a given string array.
     * @param stringArr The array of strings to check against the substring (compareStr).
     * @param compareStr The string to check if it is a substring of any member of stringArr.
     * @param matchFromBeginning Set to true if the substring must be a complete match of the beginning subset of characters of the stringArr entries. Default is false.
     * @param caseSensitive Set to true if the checks should be case sensitive. Default is false.
     * @return true if compareStr is found to be the substring of at least one string in stringArr, false otherwise.
     */
    public static isSubstringInArray(stringArr: string[], substring: string, matchFromBeginning: boolean = false, caseSensitive: boolean = false): boolean {
        return ( this.getSubstringMatchInd(stringArr, substring, 0, false, matchFromBeginning, caseSensitive) != null );
    }


    /**
     * Gets an entry in the given string array that contains the given compare string.
     * @param stringArr The string array to look for the substring in.
     * @param substring The substring to find in stringArr.
     * @param searchFrom The index to start the search from. Default is 0.
     * @param findClosestMatch Set to true if the closest match should be found rather than the first match. Default is false.
     * @param matchFromBeginning Set to true if the substring must start at the first character of string in stringArr. Default is false.
     * @param caseSensitive Set to true if the search should be case sensitive. Default is false.
     * @return The index of the found match. If no match is found, then null.
     */
    public static getSubstringMatchInd(stringArr: string[], substring: string, searchFrom: number = 0, findClosestMatch: boolean = false,
                                       matchFromBeginning: boolean = false, caseSensitive: boolean = false): number
    {
        let matchInd: number = null;
        let matchCharStart: number = 10000000; // Some big number (string matches closer to start are closer matches)!
        let charStart: number;

        const matchStr: string = caseSensitive ? substring
                                               : substring.toLowerCase();
        const matchRegExp: RegExp = new RegExp('^' + this.escapeRegExp(matchStr));

        for (let i: number = searchFrom; i < stringArr.length; i++) {

            const arrEntry: string = caseSensitive ? stringArr[i]
                                                   : stringArr[i].toLowerCase();

            if (matchFromBeginning && arrEntry.match(matchRegExp)) {
                return i;
            }
            else if (!matchFromBeginning) {

                let charStart: number = arrEntry.indexOf(matchStr);

                // Can we return index because it is as close to string as possible or we are not looking for closest match?
                if (charStart === 0 || (!findClosestMatch && charStart > 0)) {
                    return i;
                }

                // Or did we find a string that is better than our current closest match?
                if (charStart > 0 && charStart < matchCharStart) {
                    matchInd = i;
                    matchCharStart = charStart;
                }
            }
        }

        return matchInd;
    }


    /**
     * Generates a random alphabetical string consisting of possible upper and lower case letters.
     * @param length The length of the string to generate.
     * @return The randomly generated string.
     */
    public static genRandomString(length: number) {

        let randString = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      
        for (let i: number = 0; i < length; i++) {
            randString += possible.charAt(Math.floor(Math.random() * possible.length));
        }
      
        return randString;
    }


    /**
     * Inserts a given character/string into another given string at a given character index.
     * @param insertIntoStr The string to insert insertStr into.
     * @param insertStr The string that will be inserted into insertIntoStr.
     * @param index The index where insertStr will be inserted.
     * @return The resulting string of the insertion.
     */
    public static insertCharAt(insertIntoStr: string, insertStr: string, index: number): string {
        return ( insertIntoStr.substr(0, index) + insertStr + insertIntoStr.substr(index) );
    }
}
