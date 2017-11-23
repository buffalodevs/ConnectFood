import { Pipe, PipeTransform } from '@angular/core';


/**
 * Takes a number (N) as input and generates an array of the size of that number.
 * The array contains all numbers in order in range [0, N).
 */
@Pipe({
    name: 'numRange'
})
export class NumRangePipe implements PipeTransform {
    
    public transform(value: number, args: string[]): number[] {

        let res = [];

        for (let i: number = 0; i < value; i++) {
            res.push(i);
        }

        return res;
    }
}
