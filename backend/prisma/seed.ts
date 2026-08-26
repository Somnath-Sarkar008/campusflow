import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { RoleName, RoomType, ResourceType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🌱 Seeding CampusFlow database...');

  // -------------------------
  // Roles
  // -------------------------

  const roles = await Promise.all(
    Object.values(RoleName).map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: {
          name,
          description: `${name} role`,
        },
      }),
    ),
  );

  const roleMap = Object.fromEntries(
    roles.map((role) => [role.name, role]),
  );

  // -------------------------
  // Users
  // -------------------------

  const passwordHash = await bcrypt.hash('CampusFlow@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@campusflow.local' },
    update: {},
    create: {
      email: 'admin@campusflow.local',
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      emailVerified: true,
    },
  });

  const faculty = await prisma.user.upsert({
    where: { email: 'faculty@campusflow.local' },
    update: {},
    create: {
      email: 'faculty@campusflow.local',
      passwordHash,
      firstName: 'Rahul',
      lastName: 'Sen',
      emailVerified: true,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@campusflow.local' },
    update: {},
    create: {
      email: 'student@campusflow.local',
      passwordHash,
      firstName: 'Arjun',
      lastName: 'Das',
      emailVerified: true,
    },
  });

  // -------------------------
  // Assign Roles
  // -------------------------

  await prisma.userRole.createMany({
    data: [
      {
        userId: admin.id,
        roleId: roleMap.ADMIN.id,
      },
      {
        userId: faculty.id,
        roleId: roleMap.FACULTY.id,
      },
      {
        userId: student.id,
        roleId: roleMap.STUDENT.id,
      },
    ],
    skipDuplicates: true,
  });

  // -------------------------
  // Building
  // -------------------------

  const building = await prisma.building.upsert({
    where: { code: 'MAB' },
    update: {},
    create: {
      name: 'Main Academic Building',
      code: 'MAB',
      description: 'Primary academic building',
      address: 'Campus Main Block',
    },
  });

  // -------------------------
  // Floors
  // -------------------------

  const ground = await prisma.floor.upsert({
    where: {
      buildingId_floorNumber: {
        buildingId: building.id,
        floorNumber: 0,
      },
    },
    update: {},
    create: {
      buildingId: building.id,
      floorNumber: 0,
      name: 'Ground Floor',
    },
  });

  const first = await prisma.floor.upsert({
    where: {
      buildingId_floorNumber: {
        buildingId: building.id,
        floorNumber: 1,
      },
    },
    update: {},
    create: {
      buildingId: building.id,
      floorNumber: 1,
      name: 'First Floor',
    },
  });

  const second = await prisma.floor.upsert({
    where: {
      buildingId_floorNumber: {
        buildingId: building.id,
        floorNumber: 2,
      },
    },
    update: {},
    create: {
      buildingId: building.id,
      floorNumber: 2,
      name: 'Second Floor',
    },
  });

  // -------------------------
  // Rooms
  // -------------------------

  const classroom101 = await prisma.room.create({
    data: {
      floorId: first.id,
      name: 'Classroom 101',
      roomNumber: '101',
      type: RoomType.CLASSROOM,
      capacity: 60,
    },
  });

  const classroom102 = await prisma.room.create({
    data: {
      floorId: first.id,
      name: 'Classroom 102',
      roomNumber: '102',
      type: RoomType.CLASSROOM,
      capacity: 50,
    },
  });

  const lab201 = await prisma.room.create({
    data: {
      floorId: second.id,
      name: 'Computer Lab 201',
      roomNumber: '201',
      type: RoomType.LAB,
      capacity: 40,
    },
  });

  const lab202 = await prisma.room.create({
    data: {
      floorId: second.id,
      name: 'Computer Lab 202',
      roomNumber: '202',
      type: RoomType.LAB,
      capacity: 40,
    },
  });

  const seminarHall = await prisma.room.create({
    data: {
      floorId: ground.id,
      name: 'Seminar Hall',
      roomNumber: 'SH-01',
      type: RoomType.SEMINAR_HALL,
      capacity: 200,
    },
  });

  // -------------------------
  // Resources
  // -------------------------

  await prisma.resource.createMany({
    data: [
      {
        roomId: classroom101.id,
        name: 'Projector 101',
        type: ResourceType.PROJECTOR,
        serialNumber: 'PROJ-101',
      },
      {
        roomId: classroom102.id,
        name: 'Projector 102',
        type: ResourceType.PROJECTOR,
        serialNumber: 'PROJ-102',
      },
      {
        roomId: lab201.id,
        name: 'Computer Lab 201 - Systems',
        type: ResourceType.COMPUTER,
        serialNumber: 'LAB201-SYS',
      },
      {
        roomId: lab202.id,
        name: 'Computer Lab 202 - Systems',
        type: ResourceType.COMPUTER,
        serialNumber: 'LAB202-SYS',
      },
      {
        roomId: seminarHall.id,
        name: 'Seminar Hall Projector',
        type: ResourceType.PROJECTOR,
        serialNumber: 'PROJ-SH01',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ CampusFlow database seeded successfully.');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });