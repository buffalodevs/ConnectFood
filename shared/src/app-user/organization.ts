//import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";


export class Organization {

    public constructor (
        public name: string = null,
        public taxId: string = null
    ) {}
}
