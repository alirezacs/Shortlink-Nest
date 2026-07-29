import AppDataSource from "./data-source";
import { seed } from "./seeds/seed";

async function bootstrap(): Promise<void>{
    try{
        console.log("Connecting to database...");

        await AppDataSource.initialize();

        console.log("Database connected");

        await seed(AppDataSource);
        
        console.log("Database seeding completed.");
        
        await AppDataSource.destroy();

        process.exit(0);
    }catch(error){
        console.error("Seeder failed");
        console.error(error);
        
        process.exit(1);
    }
}

bootstrap();