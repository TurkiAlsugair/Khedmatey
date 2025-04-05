import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  //connects to the database
  async onModuleInit() {
    try {
      await this.$connect(); //it stil works without this but it will lazely connect to the database for every query
      console.log("connected to db");
    } catch (err) {
      console.error(err);
    }

    // try {
    //   // This to create UserView
    //   await this.$executeRawUnsafe(`
    //         CREATE OR REPLACE VIEW UserView AS 
    //         SELECT id, username, phoneNumber, 'CUSTOMER' AS role FROM Customer 
    //         UNION ALL 
    //         SELECT id, username, phoneNumber, 'serviceProvider' AS role FROM ServiceProvider;
    //     `);

    //   console.log("UserView created or updated successfully");
    // } catch (err) {
    //   console.error("Problem when creating UserView");
    // }
  }
}
