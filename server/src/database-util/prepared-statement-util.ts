import * as _ from "lodash";


/**
 * Generates and inserts placeholder arguments in between SQL function argument braces in the given queryStr.
 * Also, combines the effects of preProcessQueryArgs. See the definition of preProcessQueryArgs() below for more details.
 * @param queryStr The original query string that needs its placeholder function arguments generated.
 * @param queryArgs The actual arguments to the SQL function (used to generate placeholders).
 *                  NOTE: (INTERNALLY MODIFIED) All null/undefined entries will be removed internally.
 * @param insertIndex An optional insert index where the placeholders will be inserted in the query string.
 *                     By default, the placeholders are automatically placed in between SQL function argument braces: '()'.
 * @param noPreprocessQueryArgs An optional flag that tells the function not to preprocess query argument using the preProcessQueryArgs function.
 *                              Default value is false so that preprocessing will occur.
 * @return The original queryStr with placeholder function arugments included.
 */
export function addArgPlaceholdersToQueryStr(queryStr: string, queryArgs: any[], insertIndex?: number, noPreprocessQueryArgs: boolean = false): string {

    // If no insert index provided, then assume we are inserting in between braces of SQL function.
    insertIndex = (insertIndex == null) ? ( queryStr.indexOf('()') + 1 )
                                        : insertIndex;

    // Generate the function argument placeholder string (based at $1).
    let placeholderStr: string = '$1'; // Assume we have at least one argument to simplify string concatenation...
    for (let i: number = 2; i <= queryArgs.length; i++) {
        placeholderStr += ( ', $' + i );
    }

    // Insert the placeholder function arguments into the queryStr and complete any required pre-processing of query arguments.
    const queryStrWithPlaceholders: string = ( queryStr.slice(0, insertIndex) + placeholderStr + queryStr.slice(insertIndex) );
    return ( noPreprocessQueryArgs ? queryStrWithPlaceholders
                                   : preProcessQueryArgs(queryStrWithPlaceholders, queryArgs) );
}


/**
 * Removes all null entries in an argument list to a parameterized SQL prepared statement to prevent errors.
 * @param queryStr The query string with parameters in it.
 * @param queryArgs The arguments to a parameterized SQL prepared statement.
 *                  NOTE: (INTERNALLY MODIFIED) All null/undefined entries will be removed internally.
 * @return The resulting queryStr with all paraemters corresponding to null arguments replaced with null literals.
 */
export function preProcessQueryArgs(queryStr: string, queryArgs: any[]): string {

    let replaceSearch: string;
    let replaceVal: string;

    for (let i: number = 0; i < queryArgs.length; i++) {

        // If we have a null/undefined query argument, then replace its placeholder with a null literal!
        if (queryArgs[i] == null) {

            // Replace the argument in the query string with null
            replaceSearch = '$' + (i + 1).toString();
            replaceVal = 'null';
            queryStr = queryStr.replace(replaceSearch, replaceVal);

            // Set all other higher $<j> parameters in query string to be $<j - 1>
            for (let j: number = i + 1; j < queryArgs.length; j++) {
                replaceSearch = '$' + (j + 1).toString();
                replaceVal = '$' + (j).toString();
                queryStr = queryStr.replace(replaceSearch, replaceVal);
            }

            // Finally remove argument from queryArgs
            queryArgs.splice(i, 1);
            i = i - 1;
        }
    }

    return queryStr;
}
