import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";

const prisma = new PrismaClient();

const DEPARTMENTS = [
    {
        name: 'Medicine',
        description: 'Medicine department',
        services: [
            'lab services',
            'flu shot',
            'joint injections',
            'palliative care',
        ],
    },
    {
        name: 'Surgery',
        description: 'Surgery department',
        services: ['cancer surgery', 'plastic surgery', 'digestive surgery', 'heart surgery'],
    },
    {
        name: 'Gynecology',
        description: 'Gynecology department',
        services: ['wellness exam', 'endometrial ablation', 'pre- and post- menopause', 'sexually transmitted infection (STI) screening and treatment'],
    },
    {
        name: 'Obstetrics',
        description: 'Obstetrics department',
        services: ['pregnancy care', 'prenatal care', 'normal delivery', 'cesarean section'],
    },
    {
        name: 'Pediatrics',
        description: 'Pediatrics department',
        services: ['well-child visit', 'after hours care', 'immunization', 'prenatal visit'],
    },
    {
        name: 'Radiology',
        description: 'Radiology department',
        services: ['MRI', 'ultrasound', 'Computer Tomography scanning', 'X-ray scanning'],
    },
    {
        name: 'Eye',
        description: 'Eye department',
        services: ['cycloscopy', 'gonioscopy', 'skiascopy', 'optical coherence tomography'],
    },
    {
        name: 'ENT',
        description: 'ENT department',
        services: ['diagnostic endoscopic examination', 'foreign body removal', 'laryngoscopy', 'tympanometry'],
    },
    {
        name: 'Dental',
        description: 'Dental department',
        services: ['teeth cleaning', 'tooth extraction', 'teeth whitening', 'root canal therapy'],
    },
    {
        name: 'Orthopedics',
        description: 'Orthopedics department',
        services: ['fracture care', 'joint fusion', 'ligament reconstruction', 'bunionectomy'],
    },
    {
        name: 'Neurology',
        description: 'Neurology department',
        services: ['General neurology consultation', 'Neuromuscular disorders treatment', 'Epilepsy treatment', 'Neurosurgery'],
    },
    {
        name: 'Cardiology',
        description: 'Cardiology department',
        services: ['General cardiology consultation', 'ardiac rehabilitation', 'Heart rhythm monitoring', 'Echocardiography', 'Stenting']
    },
    {
        name: 'Psychiatry',
        description: 'Psychiatry department',
        services: ['Consultation', 'Child consultation', 'Transcranial magnetic stimulation', 'Neurofeedback'],
    },
    {
        name: 'Skin',
        description: 'Skin department',
        services: ['Medical skin consultation', 'Ultrasound Treatment', 'Radio-Frequency Treatment', 'Light Sources Treatment'],
    },
];

const main = async () => {
    await prisma.service.deleteMany();
    await prisma.department.deleteMany();
    await prisma.user.deleteMany();


    const hashedPassword = await hash('123123');

    await prisma.user.create({
        data: {
            name: 'Admin',
            pin: '000000000000',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    await Promise.all(
        DEPARTMENTS.map(async (department) => {
            const dep = await prisma.department.create({
                data: {
                    name: department.name,
                    description: department.description,
                },
            });
            await Promise.all(
                department.services.map((service) => {
                    return prisma.service.create({
                        data: {
                            name: service,
                            department: {
                                connect: {
                                    id: dep.id,
                                },
                            },
                        },
                    });
                })
            );
        })
    );
}

main();