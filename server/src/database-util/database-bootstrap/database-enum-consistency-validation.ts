import { query, QueryResult } from "../connection-pool";
import { logger } from "../../logging/logger";
import { prettyjsonRender } from "./../../logging/logger";

import { AppUserType } from "../../../../shared/src/app-user/app-user-domain/app-user-type";
import { FoodType } from "../../../../shared/src/common-user/food-listing-domain/food-type"
import { VehicleType } from "../../../../shared/src/common-user/food-listing-domain/vehicle-type"
import { FoodListingsStatus } from "../../../../shared/src/common-user/food-listing-domain/food-listings-status";
import { DeliveryState } from "../../../../shared/src/common-user/food-listing-domain/delivery-state";
import * as _ from "lodash";


/**
 * Validates that all mappings between server's typescript and database's SQL enums are consistent.
 * @return A promise that resolves to no value on success.
 */
export async function validateDatabaseEnumConsistency(): Promise <void> {

    // Add any enums here that should be mapped to SQL enums!
    const registeredSQLEnums: any = {
        'AppUserType':          AppUserType,
        'FoodType':             FoodType,
        'VehicleType':          VehicleType,
        'FoodListingsStatus':   FoodListingsStatus,
        'DeliveryState':        DeliveryState
    };

    return await validateMembersOfEachEnum(registeredSQLEnums);    
}


/**
 * Validates members of each enum by ensuring that typescript and SQL enum versions have the same members.
 * NOTE: Typescript enum values (which should be strings) are the SQL enum versions' keys.
 * @param registeredSQLEnums The registered SQL enums.
 * @return The queried members for each enum
 */
async function validateMembersOfEachEnum(registeredSQLEnums: any): Promise <void> {

    // Query each enum from the database.
    for (let enumName in registeredSQLEnums) {
        if (!registeredSQLEnums.hasOwnProperty(enumName))   continue;

        // Query SQL enum values and gather all members of SQL enum version.
        const enumQueryResult: QueryResult = await query('SELECT unnest(enum_range(NULL::' + enumName + ')) AS enumval');
        const sqlEnumValues: string[] = enumQueryResult.rows.map((row: any) => row.enumval);
            
        // Grab registered typescript enum instance and extract values from it.
        const tsEnum: any = registeredSQLEnums[enumName];
        const tsEnumValues: string[] = Object.keys(tsEnum).map((key: string) => tsEnum[key]);

        // Compare the enum instances (ensure both contain exact same members).
        const diffMembers: string[] = _.xor(tsEnumValues, sqlEnumValues);
        if (!_.isEmpty(diffMembers)) {
            throw new Error('Typescript and SQL version of enum named \'' + enumName + '\' are different.\n' +
                            'Diff members include:\n' + prettyjsonRender(diffMembers) + '\n');
        }
        else {
            logger.debug('\'' + enumName + '\' enums consistent between TypeScript and SQL versions with values:\n' + prettyjsonRender(sqlEnumValues));
        }
    }
}
