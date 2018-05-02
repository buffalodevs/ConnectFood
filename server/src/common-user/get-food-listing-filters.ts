import { FoodListingFilters } from "../../../shared/src/common-user/food-listing-filters"
import { addArgPlaceholdersToQueryStr } from "../database-util/prepared-statement-util";
import { logSqlQueryExec, logSqlQueryResult } from "../logging/sql-logger";
import { query, QueryResult } from "../database-util/connection-pool";
import { logger } from "../logging/logger";


export async function getFoodListingFilters(myAppUserKey: number, foodListingFiltersKey: number): Promise <FoodListingFilters> {

    try {

        // Build our prepared statement.    
        let queryArgs: any[] = [ myAppUserKey, foodListingFiltersKey ];
        let queryString = addArgPlaceholdersToQueryStr('SELECT * FROM getFoodListingFilters();', queryArgs);
        logSqlQueryExec(queryString, queryArgs);

        const queryResult: QueryResult = await query(queryString, queryArgs);
        logSqlQueryResult(queryResult.rows);

        if (queryResult.rowCount === 1) {
            return queryResult.rows[0].foodlistingfilters;
        }
    }
    catch (err) {
        logger.error(err);
    }
    
    throw new Error('Could not retrieve specified filters.');
}
