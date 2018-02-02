import { Injectable } from '@angular/core';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { Subscriber } from 'rxjs/Subscriber';

import { StringManipulation } from '../../../../../shared/src/common-util/string-manipulation';


@Injectable()
export class SlickTypeaheadService {

    public readonly PLACEMENT: string[];


    public constructor() {
        this.PLACEMENT = [ 'bottom-left', 'top-left' ];
    }


    /**
     * Generates a typeahead options filter/generator function.
     * @param input The input that the typeahead is attached to.
     * @param options The base options that the filter shall work on. Can either be a string array of options,
     *                or a custom filter function that takes as input a filter string and returns an observable that resolves to filtered options.
     * @param maxNumOpts The maximum number of options that shall be returned. Default is 50.
     * @param openOnInteract Determines whether or not the typeahead shall be automatically opened upon interacting with the associated input.
     * @return A filter function that takes as input an observable that resolves every time the base input value changes (which provides a filter), and provides
     *         an observable that resolves to the filtered typeahead options. See NgbTypeahead documentation for more details.
     */
    public genOptionsFilter(input: HTMLInputElement, baseOpts: string[] | ((filterStr: string) => Observable <string[]>),
                            maxNumOpts: number = 50, openOnInteract: boolean = true): (filterFn: Observable <string>) => Observable <string[]>
    {
        return (filterInputObservable: Observable <string>) => {

            let onFocusObservable: Observable <string> = new Observable <string>((subscriber: Subscriber <string>) => {

                // Open the typeahead on input focus.
                if (openOnInteract) {
                    input.addEventListener('focus', () => {
                        subscriber.next(input.value);
                    });
                }
            });

            return filterInputObservable
                .debounceTime(10)
                .distinctUntilChanged()
                .merge(onFocusObservable)
                .mergeMap((filterStr: string): Observable <string[]> => {
                    
                    // Check if we are given an observable to generate the base options from or a string array.
                    // If instead given a stirng array, then we need to generate an observable that resolves immediately to the given string array base options.
                    return (typeof(baseOpts) === 'function') ? (<((filter: string) => Observable <string[]>)>baseOpts)(filterStr)
                                                             : this.defaultFilter(filterStr, <string[]>baseOpts);
                })
                .map((filteredOpts: string[]) => {

                    // Make sure we limit the number of options that come back.
                    return filteredOpts.slice(0, maxNumOpts - 1);
                });
        }
    }


    /**
     * Applies a default filter to 
     * @param filterStr The input filter string to apply against given baseOpts.
     * @param baseOpts The base options to apply given filter string to.
     */
    private defaultFilter(filterStr: string, baseOpts: string[]): Observable <string[]> {

        let filteredOpts: string[] = StringManipulation.filterBySubstring(baseOpts, filterStr);
        filteredOpts = StringManipulation.sortByStringSimilarity(filteredOpts, filterStr);

        return Observable.of(filteredOpts);
    }
}
