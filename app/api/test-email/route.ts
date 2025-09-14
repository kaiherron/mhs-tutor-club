import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { AppointmentReminderEmail } from '../../../components/AppointmentReminderEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Melrose Tutor Club <onboarding@resend.dev>',
      to: ['kai.herron@melroseschools.com'], // Send to yourself for testing
      subject: 'Test: Tutoring Session Reminder',
      react: AppointmentReminderEmail({
        studentName: 'Test Student',
        studentEmail: 'test@example.com',
        studentPhone: '781-555-0123',
        studentGrade: '10th Grade',
        subject: 'Mathematics',
        className: 'Algebra 1',
        level: 'Honors',
        day: 'monday',
        time: '15:00',
        notes: 'This is a test appointment reminder email.',
        createdAt: new Date()
      })
    });

    if (error) {
      console.error('Error sending test email:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('Test email sent successfully:', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in test email endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}