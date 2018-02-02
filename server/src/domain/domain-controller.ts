'use strict';
import { Request, Response } from "express";

import { getDomainValues } from "./get-domain-values";

import { GetDomainValuesResponse, GetDomainValuesRequest } from '../../../shared/src/domain/get-domain-values-message';


export function handleGetDomainValues(request: Request, response: Response): void {
    
    response.setHeader('Content-Type', 'application/json');
    const getDomainValuesRequest: GetDomainValuesRequest = request.body;
    const domainName: string = getDomainValuesRequest.domainName;
    
    getDomainValues(domainName)
        .then((domainValues: string[]) => {
            response.send(new GetDomainValuesResponse(domainValues, true, 'Domain values successfully retrieved for domain: ' + domainName));
        })
        .catch((err: Error) => {
            response.send(new GetDomainValuesResponse(null, false, err.message));
        });
}