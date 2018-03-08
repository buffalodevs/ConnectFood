import * as winston from "winston";
import * as prettyjson from "prettyjson";
import * as colors from "colors";
import { LoggingWinston } from "@google-cloud/logging-winston";

export { winston, prettyjson, colors };


const DEVELOPER_MODE: boolean = ( process.env.FOOD_WEB_DEVELOPER_MODE.toLowerCase() === 'true' );
const LOGGER_LEVEL: string = DEVELOPER_MODE ? 'silly'
                                            : 'info';


/**
 * Default (color) options for prettyjson.
 */
export const prettyjsonOpts: prettyjson.RendererOptions = {
    keysColor:      'green',
    dashColor:      'magenta',
    stringColor:    'white',
    numberColor:    'cyan',
    noColor:        !DEVELOPER_MODE
}


export const logger = new(winston.Logger)({
    colors: {
        silly:      'magenta',
        debug:      'blue',
        verbose:    'cyan',
        info:       'green',
        warn:       'yellow',
        error:      'red'
    }
});


logger.add(winston.transports.Console, {
    level: LOGGER_LEVEL,
    prettyPrint: true,
    colorize: true,
    silent: false,
    timestamp: false
});


/**
 * Safe wrapper function around prettyjson.render(). Uses default prettyjsonOpts as render options (defined above).
 * See documentation for prettyjson.render() for more details.
 * @param data The data to pretty print.
 * @return The resulting pretty json string generated from given data.
 */
export function prettyjsonRender(data: any): string {

    if (data == null)    return 'null';

    return prettyjson.render(data, prettyjsonOpts);
}
