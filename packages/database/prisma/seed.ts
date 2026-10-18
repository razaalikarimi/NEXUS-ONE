// ============================================================
// Database Seed Script — NEXUS ONE
// ============================================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

async function hash(pwd: string): Promise<string> {
  return bcrypt.hash(pwd, 10);
}

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function seed() {
  console.log('🌱 Seeding database...');

  // 1. Seed Users
  const adminPassword = await hash('NexusAdmin!2026');
  const devPassword = await hash('NexusDev!2026');
  const opsPassword = await hash('NexusOps!2026');
  const analystPassword = await hash('NexusAnalyst!2026');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nexusone.dev' },
    update: {},
    create: {
      email: 'admin@nexusone.dev',
      name: 'System Administrator',
      passwordHash: adminPassword,
      emailVerified: true,
    },
  });

  const devUser = await prisma.user.upsert({
    where: { email: 'developer@nexusone.dev' },
    update: {},
    create: {
      email: 'developer@nexusone.dev',
      name: 'Sarah Chen (Lead Engineer)',
      passwordHash: devPassword,
      emailVerified: true,
    },
  });

  const opsUser = await prisma.user.upsert({
    where: { email: 'operator@nexusone.dev' },
    update: {},
    create: {
      email: 'operator@nexusone.dev',
      name: 'Marcus Vance (Site Reliability)',
      passwordHash: opsPassword,
      emailVerified: true,
    },
  });

  const analystUser = await prisma.user.upsert({
    where: { email: 'analyst@nexusone.dev' },
    update: {},
    create: {
      email: 'analyst@nexusone.dev',
      name: 'Elena Rostova (SecOps Analyst)',
      passwordHash: analystPassword,
      emailVerified: true,
    },
  });

  console.log('✓ Users created');

  // 2. Seed Organizations
  const acmeOrg = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Enterprise',
      slug: 'acme-corp',
      plan: 'enterprise',
    },
  });

  const starlightOrg = await prisma.organization.upsert({
    where: { slug: 'starlight-labs' },
    update: {},
    create: {
      name: 'Starlight Labs',
      slug: 'starlight-labs',
      plan: 'team',
    },
  });

  console.log('✓ Organizations created');

  // 3. Seed Workspaces
  await prisma.workspace.upsert({
    where: { orgId_slug: { orgId: acmeOrg.id, slug: 'production' } },
    update: {},
    create: {
      orgId: acmeOrg.id,
      name: 'Production Environment',
      slug: 'production',
      settings: { region: 'us-east-1', environment: 'production' },
    },
  });

  await prisma.workspace.upsert({
    where: { orgId_slug: { orgId: acmeOrg.id, slug: 'staging' } },
    update: {},
    create: {
      orgId: acmeOrg.id,
      name: 'Staging Environment',
      slug: 'staging',
      settings: { region: 'us-east-1', environment: 'staging' },
    },
  });

  await prisma.workspace.upsert({
    where: { orgId_slug: { orgId: starlightOrg.id, slug: 'default' } },
    update: {},
    create: {
      orgId: starlightOrg.id,
      name: 'Default Workspace',
      slug: 'default',
      settings: { environment: 'sandbox' },
    },
  });

  console.log('✓ Workspaces created');

  // 4. Seed Memberships
  // Admin -> Owner of Acme
  await prisma.membership.upsert({
    where: { userId_orgId: { userId: adminUser.id, orgId: acmeOrg.id } },
    update: { role: 'owner' },
    create: {
      userId: adminUser.id,
      orgId: acmeOrg.id,
      role: 'owner',
      status: 'active',
    },
  });

  // Admin -> Owner of Starlight
  await prisma.membership.upsert({
    where: { userId_orgId: { userId: adminUser.id, orgId: starlightOrg.id } },
    update: { role: 'owner' },
    create: {
      userId: adminUser.id,
      orgId: starlightOrg.id,
      role: 'owner',
      status: 'active',
    },
  });

  // Sarah -> Admin of Acme
  await prisma.membership.upsert({
    where: { userId_orgId: { userId: devUser.id, orgId: acmeOrg.id } },
    update: { role: 'admin' },
    create: {
      userId: devUser.id,
      orgId: acmeOrg.id,
      role: 'admin',
      status: 'active',
    },
  });

  // Marcus -> Member of Acme
  await prisma.membership.upsert({
    where: { userId_orgId: { userId: opsUser.id, orgId: acmeOrg.id } },
    update: { role: 'member' },
    create: {
      userId: opsUser.id,
      orgId: acmeOrg.id,
      role: 'member',
      status: 'active',
    },
  });

  // Elena -> Viewer of Acme
  await prisma.membership.upsert({
    where: { userId_orgId: { userId: analystUser.id, orgId: acmeOrg.id } },
    update: { role: 'viewer' },
    create: {
      userId: analystUser.id,
      orgId: acmeOrg.id,
      role: 'viewer',
      status: 'active',
    },
  });

  console.log('✓ Memberships seeded');

  // 5. Seed API Key
  const rawDemoKey = 'nx_demo_8f9c1b4e2d3a4b5c6d7e8f9012345678';
  const hashedDemoKey = hashKey(rawDemoKey);

  await prisma.apiKey.upsert({
    where: { hashedKey: hashedDemoKey },
    update: {},
    create: {
      orgId: acmeOrg.id,
      name: 'Default CI/CD Deployment Key',
      hashedKey: hashedDemoKey,
      prefix: 'nx_demo_8f9c',
      scopes: ['*'],
      status: 'active',
    },
  });

  // 6. Seed Notifications & Audit
  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        orgId: acmeOrg.id,
        type: 'system',
        title: 'Platform Initialized',
        body: 'NEXUS ONE cluster initialized successfully with all 7 services ready.',
      },
      {
        userId: devUser.id,
        orgId: acmeOrg.id,
        type: 'collaboration',
        title: 'Welcome to Acme Enterprise',
        body: 'You have been granted administrator access to Acme Enterprise.',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.auditEvent.create({
    data: {
      orgId: acmeOrg.id,
      userId: adminUser.id,
      action: 'organization.seed',
      resource: 'organization',
      resourceId: acmeOrg.id,
      metadata: { initializedBy: 'seed_script', timestamp: new Date().toISOString() },
    },
  });

  console.log('🎉 Seed completed successfully!');
}

seed()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
