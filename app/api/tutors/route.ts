import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const tutors = await prisma.tutor.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // If no tutors in database, seed with mock data
    if (tutors.length === 0) {
      console.log('No tutors found in database, seeding with mock data...');
      try {
        const mockDataPath = path.join(process.cwd(), 'public', 'tutors.json');
        const mockData = fs.readFileSync(mockDataPath, 'utf8');
        const tutorsData = JSON.parse(mockData);

        // Create tutors in database
        for (const tutor of tutorsData.tutors) {
          await prisma.tutor.create({
            data: {
              id: tutor.id,
              name: tutor.name,
              email: tutor.email,
              subjects: tutor.subjects,
              availability: tutor.availability
            }
          });
        }

        // Return the newly created tutors
        const newTutors = await prisma.tutor.findMany({
          orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ tutors: newTutors });
      } catch (seedError) {
        console.error('Error seeding tutors:', seedError);
      }
    }

    return NextResponse.json({ tutors });
  } catch (error) {
    console.error('Error fetching tutors from database:', error);

    // Try to reconnect and retry once if it's a prepared statement error
    if (error instanceof Error && error.message.includes("prepared statement")) {
      console.warn("Prepared statement error detected. Attempting to reconnect...");
      try {
        // Force a new connection
        await prisma.$disconnect();
        const freshPrisma = new PrismaClient();
        const tutors = await freshPrisma.tutor.findMany({
          orderBy: { createdAt: 'desc' }
        });
        await freshPrisma.$disconnect();
        return NextResponse.json({ tutors });
      } catch (retryError) {
        console.error("Retry failed:", retryError);
      }
    }

    // Fallback to mock data
    try {
      const mockDataPath = path.join(process.cwd(), 'public', 'tutors.json');
      const mockData = fs.readFileSync(mockDataPath, 'utf8');
      const tutorsData = JSON.parse(mockData);

      console.log('Using mock tutors data');
      return NextResponse.json(tutorsData);
    } catch (mockError) {
      console.error('Error loading mock data:', mockError);
      return NextResponse.json(
        { error: 'Failed to fetch tutors and mock data unavailable' },
        { status: 500 }
      );
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subjects, availability } = body;

    const tutor = await prisma.tutor.create({
      data: {
        name,
        email,
        subjects,
        availability
      }
    });

    return NextResponse.json({ tutor }, { status: 201 });
  } catch (error) {
    console.error('Error creating tutor:', error);
    return NextResponse.json(
      { error: 'Failed to create tutor' },
      { status: 500 }
    );
  }
}