import { PoolConfig, Pool, PoolClient, Query, QueryResult } from 'pg';
export { PoolClient, Query, QueryResult };

require('dotenv');


/**
 * The process.env object contains the global environmental variables set in the root directory's .env file.
 * For deployment on Heroku (test-bed), we will explicitly set the environmental variables using 'heroku config:set ENVIRONEMNTAL_VAR_NAME = value' via the heroku cli.
 * For deployment on Google Cloud (production), we will use a private configuration file containing environmental variables.
 */
const CONFIG : PoolConfig = {
    user:       process.env.FOOD_WEB_DATABASE_USERNAME,
    password:   (process.env.FOOD_WEB_DATABASE_PASSWORD !== 'null') ? process.env.FOOD_WEB_DATABASE_PASSWORD
                                                                    : undefined,
    host:       process.env.FOOD_WEB_DATABASE_HOST,
    port:       parseInt(process.env.FOOD_WEB_DATABASE_PORT),
    database:   process.env.FOOD_WEB_DATABASE_DATABASE,
    ssl:        (process.env.FOOD_WEB_DATABASE_HOST !== 'localhost') ? (process.env.FOOD_WEB_DATABASE_SSL.toLowerCase() === 'true')
                                                                     : false
}


/**
 * A static instace of a connection pool for pgsql.
 */
const POOL : Pool = new Pool(CONFIG);

 
/**
 * This is a convenience method for quickly implicitly obtaining a connection, executing a single query, and releasing the connection automatically when finished.
 * Feel free to use this if you are performing a single simple query.
 * @param text The prepared query statement.
 * @param values (OPTIONAL) The arguments to the prepared query statement.
 * @return A JavaScript Promise that will contain the result of the query upon success and error information upon failure.
 */
export function query(text: string, values: Array<any> = null) : Promise <QueryResult> {
    return (values != null) ? POOL.query(text, values)
                            : POOL.query(text);
}

    
/**
 * This is used to grab a connection from the underlying connection pool.
 * You are expected to release the conneciton back into the pool to make it available for others to use when you are done with it.
 * To do this, call release() on the connection object returned by this method.
 * @return A Promise that will provide a client or connection object on success that can have queries executed on it.
 */ 
export function connect() : Promise <PoolClient> {
    return POOL.connect();
}
