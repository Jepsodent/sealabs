import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt"
import "dotenv/config"

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL})
const prisma = new PrismaClient({adapter})
async function main(){
    console.log("Delete data lama dlu!")

    await prisma.user.deleteMany({
        where: {
            username: "seapedia_demo"
        }
    })

    await prisma.systemConfig.deleteMany()
    console.log("buat password untuk demo account")
    const passwordHash = await bcrypt.hash("password123",10)
    console.log("buat akun demo (1 user aja isinya 4 role dengan active role buyer)")

    const demoUser = await prisma.user.create({
        data:{ 
            username: "seapedia_demo",
            passwordHash: passwordHash,
            roles: [Role.ADMIN, Role.BUYER, Role.DRIVER, Role.SELLER],
            activeRole: Role.BUYER,

            wallet: {
                create: {
                    balance: 500000 //blance 500.000
                }
            },
            address: {
                create: {
                    label: "Rumah demo",
                    fullAddress: "Jl. SEALAB No 3, Jakarta Pusat",
                    isDefault:true,
                }
            },
            store: {
                create:{ 
                    name: "Toko Seapedia",
                    description: "Toko demo aja ga ada deskripsi lanjutan",
                    products: {
                        create: [
                            {
                                name: "Mechanical Keyboard RGB",
                                description: "Keyboard mekanikal dengan switch biru dan lampu RGB.",
                                price: 450000,
                                stock: 15,
                                imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoVtCJKgpXjWw2kzO-aVPjtbYQaCSiaU_rj4WsXIUHs0RGIGEKw11ic4A&s=10",
                            },
                            {
                                name: "Mouse Gaming Wireless",
                                description: "Mouse gaming ergonomis tanpa kabel dengan sensor presisi tinggi.",
                                price: 250000,
                                stock: 20,
                                imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCAspLlxizM5tlN3bGmhUvuXrl3vXHqCt4nvX-OlkPnCGQKyZvGeEj8-c&s=10",
                            },
                            {
                                name: "Tangzu Waner 2 ",
                                description: "Red lion Edition 10mm PET Single Dynamic In-Ear Earp.",
                                price: 350000,
                                stock: 10,
                                imageUrl: "https://tangzu.net/cdn/shop/files/20260129022108_397_251.png?v=1769676658",
                            },
                        ],                        
                    }
                }
            }
        }
    });
    console.log("Configurasi waktu sistem default = 0")
    await prisma.systemConfig.create({
        data: {
            id: "time_config",
            virtualTimeOffsetDays: 0,
        }
    })
    console.log("Selesai!")
    console.log(`-----------------------------------`);
    console.log(`Akun Demo berhasil dibuat:`);
    console.log(`- Username   : ${demoUser.username}`);
    console.log(`- Password   : password123`);
    console.log(`- Role      : BUYER, SELLER, DRIVER, ADMIN`);
    console.log(`- Role Aktif: BUYER`);
    console.log(`- Saldo awal : Rp 500.000`);
    console.log(`-----------------------------------`);

}


main().catch((e) => {
    console.error(e)
    process.exit(1)
}).finally(async() => {
    await prisma.$disconnect()
})