import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {

    //connects to the database
    async onModuleInit() {
        try{
            await this.$connect() //it stil works without this but it will lazely connect to the database for every query
            console.log("connected to db")
        }

        catch(err){
            console.error(err)
        }
    }

}
