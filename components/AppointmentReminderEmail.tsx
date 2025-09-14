import * as React from 'react';

interface AppointmentReminderEmailProps {
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  studentGrade: string;
  subject: string;
  className: string;
  level: string;
  day: string;
  time: string;
  notes?: string;
  createdAt: Date;
}

export function AppointmentReminderEmail({
  studentName,
  studentEmail,
  studentPhone,
  studentGrade,
  subject,
  className,
  level,
  day,
  time,
  notes,
  createdAt
}: AppointmentReminderEmailProps) {
  // Function to format military time to 12-hour format
  const formatTimeForEmail = (militaryTime: string) => {
    const [hours, minutes] = militaryTime.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '8px 8px 0 0',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0', fontSize: '24px' }}>📚 Tutoring Session Reminder</h1>
        <p style={{ margin: '10px 0 0 0', opacity: '0.9' }}>You have a tutoring session scheduled</p>
      </div>

      {/* Main Content */}
      <div style={{
        background: '#f8f9fa',
        padding: '25px',
        borderRadius: '0 0 8px 8px',
        marginBottom: '20px'
      }}>
        {/* Session Details */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          borderLeft: '4px solid #667eea',
          marginBottom: '15px'
        }}>
          <h2 style={{ color: '#333', marginTop: '0', fontSize: '18px' }}>📅 Session Details</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            margin: '15px 0'
          }}>
            <div>
              <strong style={{ color: '#667eea' }}>📚 Subject:</strong><br />
              {subject} - {className}
            </div>
            <div>
              <strong style={{ color: '#667eea' }}>🎯 Level:</strong><br />
              {level}
            </div>
            <div>
              <strong style={{ color: '#667eea' }}>📆 Day:</strong><br />
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </div>
            <div>
              <strong style={{ color: '#667eea' }}>⏰ Time:</strong><br />
              {formatTimeForEmail(time)}
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          <h3 style={{ color: '#333', marginTop: '0', fontSize: '16px' }}>👨‍🎓 Student Information</h3>
          <p style={{ margin: '8px 0' }}><strong>Name:</strong> {studentName}</p>
          <p style={{ margin: '8px 0' }}><strong>Email:</strong> {studentEmail}</p>
          <p style={{ margin: '8px 0' }}><strong>Phone:</strong> {studentPhone || 'Not provided'}</p>
          <p style={{ margin: '8px 0' }}><strong>Grade:</strong> {studentGrade}</p>
        </div>

        {/* Additional Notes */}
        {notes && (
          <div style={{
            background: '#fff3e0',
            padding: '15px',
            borderRadius: '8px',
            borderLeft: '4px solid #f57c00'
          }}>
            <h4 style={{ color: '#f57c00', marginTop: '0', fontSize: '14px' }}>📝 Additional Notes</h4>
            <p style={{ margin: '5px 0' }}>{notes}</p>
          </div>
        )}
      </div>

      {/* Confirmation Section */}
      <div style={{
        background: '#e8f5e8',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
        border: '1px solid #4caf50',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#2e7d32', marginTop: '0' }}>✅ Session Confirmed</h3>
        <p style={{ margin: '10px 0', color: '#2e7d32' }}>
          This session was booked on {createdAt.toLocaleDateString()} at {createdAt.toLocaleTimeString()}
        </p>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        margin: '25px 0',
        padding: '20px',
        background: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <p style={{ color: '#666', fontSize: '14px', margin: '0' }}>
          <strong>Need to reschedule?</strong><br />
          Contact the student directly or reach out to the Melrose Tutor Club coordinators.
        </p>
        <p style={{ color: '#666', fontSize: '12px', margin: '10px 0 0 0' }}>
          This is an automated reminder from Melrose Tutor Club.<br />
          Sent from appointments@melrosetutorclub.org
        </p>
      </div>
    </div>
  );
}