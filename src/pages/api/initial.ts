import { NextApiHandler } from "next";
import { hash } from 'argon2';
import { prisma } from "../../server/db/client";

const PASSWORD = 'Qwerty1!';

const handler: NextApiHandler = async (req, res) => {
    const admin = await prisma.user.findFirst({
        where: {
            id: 'admin',
        },
    });

    if (!admin) {
        const hashedPassword = await hash(PASSWORD);
        await prisma.user.create({
            data: {
                id: 'admin',
                pin: '000000000000',
                name: 'Admin',
                password: hashedPassword,
                role: 'ADMIN',
            },
        });
    }

    return res.json({ message: 'ok' });
}

export default handler;