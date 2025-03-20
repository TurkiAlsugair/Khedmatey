import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AuthCustomerService {

    constructor(private prisma: DatabaseService){}

    createCustomer(data: Prisma.CustomerCreateInput) {
        return this.prisma.customer.create({data})
    }
}
