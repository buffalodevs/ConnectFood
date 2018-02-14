import { logger, prettyjsonRender } from "./logger";
require('dotenv');


/**
 * Formats and prints out information pertaining to executing a SQL Query.
 * @param query: The SQL query.
 * @param args: The arguments to the SQL query if using a prepared statement.
 */
export function logSqlQueryExec(query: string, args?: any[]): void {

    let logLevel: string = 'info';
    let logStr: string = ( 'SQL Query:\n' + query + '\n\n' );
    
    // Print the arguments to the SQL query.
    // IMPORTANT: Only do this in developer mode since this can potentially expose private information in production mode!
    if (args != null && process.env.FOOD_WEB_DEVELOPER_MODE.toLowerCase() === 'true') {

        logLevel = 'debug'; // For safe measures, set logger to debug mode if enter into here (in case DEVELOPER_MDOE not set properly)!

        for (let i : number = 0; i < args.length; i++) {

            const argPlaceholder: string = ( '$' + (i + 1).toString() );
            logStr = logStr.replace(argPlaceholder, args[i].toString());
        }
    }

    logger.log(logLevel, logStr);
}


/**
 * Formats and prints out information pertaining to the result of a SQL Query.
 * @param rows The resulting rows of the SQL Query.
 */
export function logSqlQueryResult(rows: any[]): void {

    logger.info('Number of rows in query result: ' + rows.length);

    // IMPORTANT: Only log in DEVELOPER_MDOE (since production mode will slow down and may contain SENSITIVE DATA).
    if (process.env.FOOD_WEB_DEVELOPER_MODE.toLowerCase() === 'true') {

        let logStr: string = '';

        if (rows.length > 0) {
            logStr += ( '\n' + prettyjsonRender(rows) + '\n' );
        }

        logger.debug(logStr);
    }
}
