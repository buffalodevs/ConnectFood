/**
 * Request message format for password recovery.
 */
export class RecoverPasswordRequest {

    public constructor (
        public email: string
    ) {}
}
