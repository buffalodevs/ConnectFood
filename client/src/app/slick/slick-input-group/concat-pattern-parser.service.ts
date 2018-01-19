"use strict";
import { Injectable } from '@angular/core';
import { StringManipulation } from '../../../../../shared/common-util/string-manipulation';


/**
 * Describes the primative type.
 */
enum ConcatPatternPrimativeType {  VARIABLE, CONSTANT  }


/**
 * Container for a parsed concat pattern primative.
 */
class ConcatPatternPrimative {

    public constructor (
        public type: ConcatPatternPrimativeType,
        public value: string
    ) {}
}


/**
 * Service for sending claim, unclaim, and remove Food Listing messages to the server.
 */
@Injectable()
export class ConcatPatternParserService {

    public readonly DELIMITER: string;
    
    
    public constructor() {
        this.DELIMITER = '`';
    }


    /**
     * Parses a given concat pattern into an array of concat pattern primatives.
     * @param pattern The pattern to parse.
     * @param formValue The current value of the associated form (from which to resolve variables).
     * @return A resulting string from the parsing of the pattern.
     */
    public parseConcatPattern(pattern: string, formValue: any): string {

        let parsedPattern: string = '';
        let primatives: ConcatPatternPrimative[] = this.getPatternPrimatives(pattern);

        for (let i: number = 0; i < primatives.length; i++) {

            parsedPattern += (primatives[i].type === ConcatPatternPrimativeType.CONSTANT) ? primatives[i].value
                                                                                          : formValue[primatives[i].value];
        }

        return parsedPattern;
    }


    /**
     * Sets form values based off of an already parsed string (filled with real data).
     * @param pattern The pattern that the parsedString should follow.
     * @param parsedString The parsed string that holds formValue data in the given pattern.
     * @return The form values that have been set.
     */
    public setFormValuesFromParsedString(pattern: string, parsedString: string): any {
        
        let formValue: any = {};
        let primatives: ConcatPatternPrimative[] = this.getPatternPrimatives(pattern);

        for (let i: number = 0; i < primatives.length; i++) {

            // Stop on every constant and add the variable before it to the form value if there is one before it.
            if (primatives[i].type === ConcatPatternPrimativeType.CONSTANT) {

                let splits: string[] = StringManipulation.limitedSplit(parsedString, primatives[i].value, 2);

                // Ensure that we have found the constant to split on!
                if (splits.length === 0 || splits[0].length === parsedString.length) {
                    throw new Error('Slick Input Group parse error: Input value does not match pattern. Missing a: ' + primatives[i].value);
                }

                // If the splits yield a non-empty fist split, and the constant we are spliting
                // on is not the first primative, then first split must be a variable.
                if (splits[0].length !== 0 && i > 0) {
                    formValue[primatives[i - 1].value] = splits[0];
                }

                parsedString = splits[splits.length - 1];
            }
        }

        // If pattern ends with a variable, then we must add it here!
        if (primatives.length > 0 && primatives[primatives.length - 1].type === ConcatPatternPrimativeType.VARIABLE) {
            formValue[primatives[primatives.length - 1].value] = parsedString;
        }

        return formValue;
    }


    /**
     * Gets the variable names that are found in the pattern (strings surrounded by DELIMITER).
     * @param pattern The pattern to get variable names from.
     * @return An array of variable names that were found.
     */
    public getPatternVariableNames(pattern: string): string[] {

        let variableNames: string[] = []
        let primatives: ConcatPatternPrimative[] = this.getPatternPrimatives(pattern);

        for (let i: number = 0; i < primatives.length; i++) {
            
            if (primatives[i].type === ConcatPatternPrimativeType.VARIABLE) {
                variableNames.push(primatives[i].value);
            }
        }

        return variableNames;
    }


    /**
     * Parses a given concat pattern into an array of concat pattern primatives.
     * @param pattern The pattern to parse.
     * @return An array of parsed concat pattern primatives.
     */
    private getPatternPrimatives(pattern: string): ConcatPatternPrimative[] {
        
        let primatives: ConcatPatternPrimative[] = [];
        let patternSplits: string[];
        const variableFirst: boolean = this.variableCloseAt(pattern, 0);

        do {

            patternSplits = StringManipulation.limitedSplit(pattern, this.DELIMITER, 3);
            
            primatives = primatives.concat(this.evaluatePatternSplits(patternSplits, variableFirst));
            pattern = this.DELIMITER + patternSplits[2];
        }
        while (patternSplits[2] != null);

        return primatives;
    }


    /**
     * Checks if the given pattern starts with a variable close symbol ($$).
     * @param pattern The pattern to check.
     * @param index The index to check for the variable close symbol at.
     * @return true if it starts with the variable close, false if not.
     */
    private variableCloseAt(pattern: string, index: number): boolean {
        return (pattern.length > index && pattern.charAt(index) === this.DELIMITER);
    }


    /**
     * Evaluates pattern splits around $$ variable separators. The first 1 or 2 spits will be converted into concat pattern primatives.
     * @param patternSplits The pattern splits to evaluate.
     * @param variableFirst Set to true if the first split is determined to be a variable, false if not.
     * @return The resulting primatives generated from the splits.
     */
    private evaluatePatternSplits(patternSplits: string[], variableFirst: boolean): ConcatPatternPrimative[] {

        let primatives: ConcatPatternPrimative[] = [];

        // First split
        if (patternSplits.length > 0 && patternSplits[0].length > 0) {
            
            primatives.push (
                new ConcatPatternPrimative (
                    variableFirst ? ConcatPatternPrimativeType.VARIABLE
                                  : ConcatPatternPrimativeType.CONSTANT,
                    patternSplits[0]
                )
            );
        }

        // Second split
        if (patternSplits.length > 1 && patternSplits[1].length > 0) {

            primatives.push (
                new ConcatPatternPrimative (
                    !variableFirst ? ConcatPatternPrimativeType.VARIABLE
                                   : ConcatPatternPrimativeType.CONSTANT,
                    patternSplits[1]
                )
            );
        }

        return primatives;
    }
}
