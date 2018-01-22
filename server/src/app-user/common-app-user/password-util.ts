/**   
 * This will take the raw password as a parameter, salt it, prepend the salt to it,
 * hash the password with the salt, and then insert it into the database
 */
'use strict'; 
import { hash, genSalt, compare } from 'bcrypt';


/**
 * Creates a hash for a password so that it can be more securely stored in our database.
 * @param password The password that will have a hash generated for it.
 * @return A promise that on success will provide a string contianing both the salt and the hash of the password.
 */
export async function hashPassword(password: string): Promise <string> {

    try {

        const salt: string = await genSalt();
        return hash(password, salt);
    }
    catch (err) {
        console.log(err);
        throw new Error('An unexpected error has occured.');
    }
};


/**
 * Checks to see if a given plain text password matches a hashed password on record.
 * @param password The plain text password.
 * @param hashedPassword The hashed password.
 * @return A promise containing a boolean. If the passwords match, then true, otherwise false.
 */
export function checkPassword(password: string, hashedPassword: string): Promise <boolean> {
    return compare(password, hashedPassword);
}
