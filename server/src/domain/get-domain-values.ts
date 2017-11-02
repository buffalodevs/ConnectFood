import { logSqlQueryExec, logSqlQueryResult } from "../logging/sql-logger";
import { query, QueryResult } from "../database-util/connection-pool";


const DOMAIN_COL: string = 'domainCol';


/**
 * Gets all of the domain string values for a given Domain table/entity and packs them in an array.
 * @param domainName The name of the domain (table) from which to get values.
 * @return A promise that resolves to an array of the domain string values.
 */
export function getDomainValues(domainName: string): Promise<string[]> {

    // NOTE: Since we cannot put domainName in prepared statement, it is VERY IMPORTANT to SANATIZE domainName data here!!!!!
    if (/\s/.test(domainName)) {
        // It has any kind of whitespace, then it cannot be a valid Domain Name (Table/Enum) and can be injection attempt. RETURN NOW!!!
        throw new Error('Failed to get values in domain: ' + domainName);
    }

    let queryString: string = 'SELECT unnest(enum_range(NULL::' + domainName + ')) AS "' + DOMAIN_COL + '";'
    logSqlQueryExec(queryString);

    return query(queryString)
        .then(processDomainSelectResult)
        .catch((err: Error) => {
            // Should never happen!
            console.log(err);
            throw new Error('Failed to get values in domain: ' + domainName);
        });
}


/**
 * Processes the result of the food type select query. Packages the results into an array of domain value strings.
 * @param queryResult The result of the domain select query.
 * @return See return type of getDomainValues.
 */
function processDomainSelectResult(queryResult: QueryResult): Promise<string[]> {
    let domainValues: Array<string> = [];

    logSqlQueryResult(queryResult.rows);

    for (let i: number = 0; i < queryResult.rowCount; i++) {
        domainValues.push(queryResult.rows[i][DOMAIN_COL]);
    }

    return Promise.resolve(domainValues);
}