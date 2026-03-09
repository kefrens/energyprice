const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run(){
  const offers = await prisma.offer.findMany({where:{supplierId:1}});
  console.log('offers',offers);
  console.log('stringified:', JSON.stringify(offers));
  prisma.$disconnect();
}
run().catch(e=>{console.error(e);prisma.$disconnect();});
