import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const resend = new Resend(process.env.RESEND_API_KEY);

// Function to format military time to 12-hour format
function formatTimeForEmail(militaryTime: string) {
  const [hours, minutes] = militaryTime.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}



export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        tutor: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments from database:', error);

    // Try to reconnect and retry once if it's a prepared statement error
    if (error instanceof Error && error.message.includes("prepared statement")) {
      console.warn("Prepared statement error detected. Attempting to reconnect...");
      try {
        // Force a new connection
        await prisma.$disconnect();
        const freshPrisma = new PrismaClient();
        const appointments = await freshPrisma.appointment.findMany({
          include: {
            tutor: true
          },
          orderBy: { createdAt: 'desc' }
        });
        await freshPrisma.$disconnect();
        return NextResponse.json({ appointments });
      } catch (retryError) {
        console.error("Retry failed:", retryError);
      }
    }

    // Fallback to mock data
    try {
      const mockDataPath = path.join(process.cwd(), 'public', 'appointments.json');
      const mockData = fs.readFileSync(mockDataPath, 'utf8');
      const appointmentsData = JSON.parse(mockData);

      console.log('Using mock appointments data');
      return NextResponse.json(appointmentsData);
    } catch (mockError) {
      console.error('Error loading mock appointments data:', mockError);
      return NextResponse.json(
        { error: 'Failed to fetch appointments and mock data unavailable' },
        { status: 500 }
      );
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentName,
      email,
      phone,
      grade,
      subject,
      className,
      level,
      tutorId,
      day,
      time,
      notes,
      captchaToken
    } = body;

    // Verify captcha
    if (!captchaToken) {
      return NextResponse.json(
        { error: 'Captcha verification is required' },
        { status: 400 }
      );
    }

    const captchaResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/verify-captcha`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: captchaToken }),
    });

    if (!captchaResponse.ok) {
      return NextResponse.json(
        { error: 'Captcha verification failed' },
        { status: 400 }
      );
    }

    // Check if the tutor exists
    const tutorExists = await prisma.tutor.findUnique({
      where: { id: tutorId }
    });

    if (!tutorExists) {
      return NextResponse.json(
        { error: 'Selected tutor is not available' },
        { status: 400 }
      );
    }

    // Check if the time slot is available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        tutorId,
        day,
        time,
        status: 'confirmed'
      }
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 409 }
      );
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        studentName,
        email,
        phone,
        grade,
        subject,
        className,
        level,
        tutorId,
        day,
        time,
        date: new Date(),
        notes
      },
      include: {
        tutor: true
      }
    });

    // Send appointment reminder email to tutor
    try {
      const { data, error } = await resend.emails.send({
        from: 'Melrose Tutor Club <appointments@melrosetutorclub.org>',
        to: [appointment.tutor.email],
        subject: `📅 Tutoring Session Reminder: ${appointment.studentName} - ${appointment.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">📚 Tutoring Session Reminder</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">You have a tutoring session scheduled</p>
            </div>

            <div style="background: #f8f9fa; padding: 25px; border-radius: 0 0 8px 8px; margin-bottom: 20px;">
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
                <h2 style="color: #333; margin-top: 0; font-size: 18px;">📅 Session Details</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
                  <div>
                    <strong style="color: #667eea;">📚 Subject:</strong><br>
                    ${appointment.subject} - ${appointment.className}
                  </div>
                  <div>
                    <strong style="color: #667eea;">🎯 Level:</strong><br>
                    ${appointment.level}
                  </div>
                  <div>
                    <strong style="color: #667eea;">📆 Day:</strong><br>
                    ${appointment.day.charAt(0).toUpperCase() + appointment.day.slice(1)}
                  </div>
                  <div>
                    <strong style="color: #667eea;">⏰ Time:</strong><br>
                    ${formatTimeForEmail(appointment.time)}
                  </div>
                </div>
              </div>

              <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 15px;">
                <h3 style="color: #333; margin-top: 0; font-size: 16px;">👨‍🎓 Student Information</h3>
                <p style="margin: 8px 0;"><strong>Name:</strong> ${appointment.studentName}</p>
                <p style="margin: 8px 0;"><strong>Email:</strong> ${appointment.email}</p>
                <p style="margin: 8px 0;"><strong>Phone:</strong> ${appointment.phone || 'Not provided'}</p>
                <p style="margin: 8px 0;"><strong>Grade:</strong> ${appointment.grade}</p>
              </div>

              ${appointment.notes ? `
              <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #f57c00;">
                <h4 style="color: #f57c00; margin-top: 0; font-size: 14px;">📝 Additional Notes</h4>
                <p style="margin: 5px 0;">${appointment.notes}</p>
              </div>
              ` : ''}
            </div>

            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #4caf50;">
              <h3 style="color: #2e7d32; margin-top: 0;">✅ Session Confirmed</h3>
              <p style="margin: 10px 0; color: #2e7d32;">
                This session was booked on ${appointment.createdAt.toLocaleDateString()} at ${appointment.createdAt.toLocaleTimeString()}
              </p>
            </div>

            <div style="text-align: center; margin: 25px 0; padding: 20px; background: #f5f5f5; border-radius: 8px;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                <strong>Need to reschedule?</strong><br>
                Contact the student directly or reach out to the Melrose Tutor Club coordinators.
              </p>
              <p style="color: #666; font-size: 12px; margin: 10px 0 0 0;">
                This is an automated reminder from Melrose Tutor Club.<br>
                Sent from appointments@melrosetutorclub.org
              </p>
            </div>
          </div>
        `
      });

      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log(`Appointment reminder email sent to ${appointment.tutor.email}`, data);
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the appointment creation if email fails
    }

    // Send confirmation email to student
    try {
      const { data, error } = await resend.emails.send({
        from: 'Melrose Tutor Club <appointments@melrosetutorclub.org>',
        to: [appointment.email],
        subject: `📅 Tutoring Session Confirmation: ${appointment.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">📚 Session Confirmed</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your tutoring session has been booked successfully</p>
            </div>

            <div style="background: #f8f9fa; padding: 25px; border-radius: 0 0 8px 8px; margin-bottom: 20px;">
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
                <h2 style="color: #333; margin-top: 0; font-size: 18px;">📅 Session Details</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
                  <div>
                    <strong style="color: #667eea;">📚 Subject:</strong><br>
                    ${appointment.subject} - ${appointment.className}
                  </div>
                  <div>
                    <strong style="color: #667eea;">🎯 Level:</strong><br>
                    ${appointment.level}
                  </div>
                  <div>
                    <strong style="color: #667eea;">📆 Day:</strong><br>
                    ${appointment.day.charAt(0).toUpperCase() + appointment.day.slice(1)}
                  </div>
                  <div>
                    <strong style="color: #667eea;">⏰ Time:</strong><br>
                    ${formatTimeForEmail(appointment.time)}
                  </div>
                </div>
              </div>

              <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 15px;">
                <h3 style="color: #333; margin-top: 0; font-size: 16px;">👨‍🏫 Tutor Information</h3>
                <p style="margin: 8px 0;"><strong>Name:</strong> ${appointment.tutor.name}</p>
                <p style="margin: 8px 0;"><strong>Email:</strong> ${appointment.tutor.email}</p>
              </div>

              ${appointment.notes ? `
              <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #f57c00;">
                <h4 style="color: #f57c00; margin-top: 0; font-size: 14px;">📝 Additional Notes</h4>
                <p style="margin: 5px 0;">${appointment.notes}</p>
              </div>
              ` : ''}
            </div>

            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #4caf50;">
              <h3 style="color: #2e7d32; margin-top: 0;">✅ Booking Confirmed</h3>
              <p style="margin: 10px 0; color: #2e7d32;">
                This session was booked on ${appointment.createdAt.toLocaleDateString()} at ${appointment.createdAt.toLocaleTimeString()}
              </p>
            </div>

            <div style="text-align: center; margin: 25px 0; padding: 20px; background: #f5f5f5; border-radius: 8px;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                <strong>Need to reschedule?</strong><br>
                Contact your tutor directly or reach out to the Melrose Tutor Club coordinators.
              </p>
              <p style="color: #666; font-size: 12px; margin: 10px 0 0 0;">
                This is an automated confirmation from Melrose Tutor Club.<br>
                Sent from appointments@melrosetutorclub.org
              </p>
            </div>
          </div>
        `
      });

      if (error) {
        console.error('Error sending student email:', error);
      } else {
        console.log(`Confirmation email sent to ${appointment.email}`, data);
      }
    } catch (emailError) {
      console.error('Error sending student email:', emailError);
      // Don't fail the appointment creation if email fails
    }

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);

    // Try to reconnect and retry once if it's a prepared statement error
    if (error instanceof Error && error.message.includes("prepared statement")) {
      console.warn("Prepared statement error detected. Attempting to reconnect...");
      try {
        // Force a new connection and retry the entire operation
        await prisma.$disconnect();
        const freshPrisma = new PrismaClient();

        const body = await request.json();
        const {
          studentName,
          email,
          phone,
          grade,
          subject,
          className,
          level,
          tutorId,
          day,
          time,
          notes,
          captchaToken
        } = body;

        // Check if the tutor exists
        const tutorExists = await freshPrisma.tutor.findUnique({
          where: { id: tutorId }
        });

        if (!tutorExists) {
          await freshPrisma.$disconnect();
          return NextResponse.json(
            { error: 'Selected tutor is not available' },
            { status: 400 }
          );
        }

        // Check if the time slot is available
        const existingAppointment = await freshPrisma.appointment.findFirst({
          where: {
            tutorId,
            day,
            time,
            status: 'confirmed'
          }
        });

        if (existingAppointment) {
          await freshPrisma.$disconnect();
          return NextResponse.json(
            { error: 'This time slot is no longer available' },
            { status: 409 }
          );
        }

        // Create the appointment
        const appointment = await freshPrisma.appointment.create({
          data: {
            studentName,
            email,
            phone,
            grade,
            subject,
            className,
            level,
            tutorId,
            day,
            time,
            date: new Date(),
            notes
          },
          include: {
            tutor: true
          }
        });

        await freshPrisma.$disconnect();
        return NextResponse.json({ appointment }, { status: 201 });
      } catch (retryError) {
        console.error("Retry error:", retryError);
      }
    }

    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}