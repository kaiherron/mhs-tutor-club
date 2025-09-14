'use client';

import { useState, useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

interface Tutor {
  id: string;
  name: string;
  email: string;
  subjects: {
    [subject: string]: {
      [className: string]: string[];
    };
  };
  availability: {
    [key: string]: string[];
  };
}

interface Appointment {
  id: string;
  studentName: string;
  email: string;
  phone: string;
  grade: string;
  subject: string;
  level: string;
  tutorId: string;
  day: string;
  time: string;
  date: string;
}

type Step = 'subject' | 'class' | 'level' | 'day' | 'tutor' | 'time' | 'details' | 'confirm';

const subjects = [
  {
    name: 'Mathematics',
    icon: '🧮',
    color: 'bg-blue-100 hover:bg-blue-200',
    classes: ['Algebra 1', 'Geometry', 'Algebra 2', 'Precalculus']
  },
  {
    name: 'English',
    icon: '📚',
    color: 'bg-green-100 hover:bg-green-200',
    classes: ['English 1', 'English 2']
  },
  {
    name: 'Science',
    icon: '🧪',
    color: 'bg-purple-100 hover:bg-purple-200',
    classes: ['Biology', 'Chemistry', 'Physics']
  },
  {
    name: 'History',
    icon: '📜',
    color: 'bg-yellow-100 hover:bg-yellow-200',
    classes: ['World History', 'US 1']
  }
];

const levels = [
  { name: 'CP', description: 'College Prep', color: 'bg-gray-100 hover:bg-gray-200' },
  { name: 'Honors', description: 'Honors Level', color: 'bg-blue-100 hover:bg-blue-200' },
  { name: 'AP', description: 'Advanced Placement', color: 'bg-purple-100 hover:bg-purple-200' }
];

const days = [
  { value: 'monday', label: 'Monday', short: 'Mon' },
  { value: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { value: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { value: 'thursday', label: 'Thursday', short: 'Thu' },
  { value: 'friday', label: 'Friday', short: 'Fri' }
];

// Function to convert military time to 12-hour format
const formatTime = (militaryTime: string) => {
  const [hours, minutes] = militaryTime.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export default function BookingForm() {
  const [currentStep, setCurrentStep] = useState<Step>('subject');
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTutor, setSelectedTutor] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTutors, setAvailableTutors] = useState<Tutor[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availableLevels, setAvailableLevels] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showBookAnother, setShowBookAnother] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    phone: '',
    grade: '',
    additionalNotes: ''
  });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const tutorsResponse = await fetch('/api/tutors');
        const tutorsData = await tutorsResponse.json();
        setTutors(tutorsData.tutors);

        const appointmentsResponse = await fetch('/api/appointments');
        const appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData.appointments);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Update available classes when subject changes
  useEffect(() => {
    if (selectedSubject) {
      const subjectData = subjects.find(s => s.name === selectedSubject);
      if (subjectData) {
        setAvailableClasses(subjectData.classes);
      }
      setSelectedClass('');
      setSelectedLevel('');
      setAvailableLevels([]);
      setAvailableTutors([]);
    }
  }, [selectedSubject]);

  // Update available levels when class changes
  useEffect(() => {
    if (selectedSubject && selectedClass && Array.isArray(tutors) && tutors.length > 0) {
      const levels = new Set<string>();
      tutors.forEach(tutor => {
        const subjectClasses = tutor.subjects[selectedSubject];
        if (subjectClasses && subjectClasses[selectedClass]) {
          subjectClasses[selectedClass].forEach(level => levels.add(level));
        }
      });
      setAvailableLevels(Array.from(levels));
      setSelectedLevel('');
      setAvailableTutors([]);
    } else {
      setAvailableLevels([]);
    }
  }, [selectedSubject, selectedClass, tutors]);

  // Update available tutors when subject, class, and level change
  useEffect(() => {
    if (selectedSubject && selectedClass && selectedLevel && Array.isArray(tutors) && tutors.length > 0) {
      const available = tutors.filter(tutor => {
        const subjectClasses = tutor.subjects[selectedSubject];
        return subjectClasses && subjectClasses[selectedClass]?.includes(selectedLevel);
      });
      setAvailableTutors(available);
    } else {
      setAvailableTutors([]);
    }
  }, [selectedSubject, selectedClass, selectedLevel, tutors]);

  // Update available times when tutor and day change
  useEffect(() => {
    if (selectedTutor && selectedDay && Array.isArray(tutors) && tutors.length > 0) {
      const tutor = tutors.find(t => t.id === selectedTutor);
      if (tutor) {
        setAvailableTimes(tutor.availability[selectedDay] || []);
      }
    } else {
      setAvailableTimes([]);
    }
  }, [selectedTutor, selectedDay, tutors]);

  const checkAvailability = (tutorId: string, day: string, time: string) => {
    return !appointments.some(apt =>
      apt.tutorId === tutorId &&
      apt.day === day &&
      apt.time === time
    );
  };

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const nextStep = () => {
    const steps: Step[] = ['subject', 'class', 'level', 'day', 'tutor', 'time', 'details', 'confirm'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ['subject', 'class', 'level', 'day', 'tutor', 'time', 'details', 'confirm'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    nextStep();
  };

  const handleClassSelect = (className: string) => {
    setSelectedClass(className);
    nextStep();
  };

  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    nextStep();
  };

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
    nextStep();
  };

  const handleTutorSelect = (tutorId: string) => {
    setSelectedTutor(tutorId);
    nextStep();
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    nextStep();
  };

  const handleSubmit = async (captchaToken: string) => {
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName: formData.studentName,
          email: formData.email,
          phone: formData.phone,
          grade: formData.grade,
          subject: selectedSubject,
          className: selectedClass,
          level: selectedLevel,
          tutorId: selectedTutor,
          day: selectedDay,
          time: selectedTime,
          notes: formData.additionalNotes,
          captchaToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book appointment');
      }

      const data = await response.json();

      // Show success toast
      setToastMessage('Appointment booked successfully! 🎉');
      setToastType('success');
      setShowToast(true);

      // Hide toast after 3 seconds and show "book another" option
      setTimeout(() => {
        setShowToast(false);
        setShowBookAnother(true);
      }, 3000);

      // Reset form
      setCurrentStep('subject');
      setSelectedSubject('');
      setSelectedClass('');
      setSelectedLevel('');
      setSelectedDay('');
      setSelectedTutor('');
      setSelectedTime('');
      setFormData({
        studentName: '',
        email: '',
        phone: '',
        grade: '',
        additionalNotes: ''
      });

    } catch (error) {
      console.error('Error booking appointment:', error);
      setSubmitMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'There was an error booking your appointment. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'subject', label: 'Subject' },
      { key: 'class', label: 'Class' },
      { key: 'level', label: 'Level' },
      { key: 'day', label: 'Day' },
      { key: 'tutor', label: 'Tutor' },
      { key: 'time', label: 'Time' },
      { key: 'details', label: 'Details' },
      { key: 'confirm', label: 'Confirm' }
    ];

    return (
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-2">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                steps.findIndex(s => s.key === currentStep) >= index
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  steps.findIndex(s => s.key === currentStep) > index
                    ? 'bg-gray-800'
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSubjectStep = () => (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">What subject do you need help with?</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        {subjects.map((subject) => (
          <button
            key={subject.name}
            onClick={() => handleSubjectSelect(subject.name)}
            className={`p-6 rounded-xl border-2 border-transparent transition-all duration-200 ${subject.color} hover:scale-105`}
          >
            <div className="text-4xl mb-2">{subject.icon}</div>
            <div className="font-semibold text-gray-800">{subject.name}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderLevelStep = () => (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">What level is your {selectedSubject} class?</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-xl mx-auto">
        {levels.map((level) => (
          <button
            key={level.name}
            onClick={() => handleLevelSelect(level.name)}
            className={`p-6 rounded-xl border-2 border-transparent transition-all duration-200 ${level.color} hover:scale-105`}
          >
            <div className="text-2xl font-bold text-gray-800 mb-2">{level.name}</div>
            <div className="text-gray-600">{level.description}</div>
          </button>
        ))}
      </div>
      <button
        onClick={prevStep}
        className="mt-6 text-gray-600 hover:text-gray-800 font-medium"
      >
        ← Back to subjects
      </button>
    </div>
  );

  const renderDayStep = () => (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">What day works best for you?</h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-2xl mx-auto">
        {days.map((day) => (
          <button
            key={day.value}
            onClick={() => handleDaySelect(day.value)}
            className="p-6 rounded-xl bg-gray-100 hover:bg-gray-200 border-2 border-transparent hover:border-gray-300 transition-all duration-200 hover:scale-105"
          >
            <div className="text-lg font-bold text-gray-800">{day.short}</div>
            <div className="text-sm text-gray-600">{day.label}</div>
          </button>
        ))}
      </div>
      <button
        onClick={prevStep}
        className="mt-6 text-gray-600 hover:text-gray-800 font-medium"
      >
        ← Back to level
      </button>
    </div>
  );

  const renderTutorStep = () => (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Choose your tutor</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {availableTutors.map((tutor) => (
          <button
            key={tutor.id}
            onClick={() => handleTutorSelect(tutor.id)}
            className="p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-400 transition-all duration-200 hover:scale-105 text-left"
          >
            <div className="text-xl font-bold text-gray-800 mb-2">{tutor.name}</div>
            <div className="text-gray-600 text-sm">
              Specializes in {selectedSubject} ({selectedLevel})
            </div>
          </button>
        ))}
      </div>
      <button
        onClick={prevStep}
        className="mt-6 text-gray-600 hover:text-gray-800 font-medium"
      >
        ← Back to day
      </button>
    </div>
  );

  const renderTimeStep = () => (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">What time works for you?</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-xl mx-auto">
        {availableTimes.map((time) => {
          const isAvailable = checkAvailability(selectedTutor, selectedDay, time);
          return (
            <button
              key={time}
              onClick={() => isAvailable && handleTimeSelect(time)}
              disabled={!isAvailable}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                isAvailable
                  ? 'bg-green-100 hover:bg-green-200 border-green-300 hover:scale-105'
                  : 'bg-red-100 border-red-300 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="text-lg font-bold text-gray-800">{formatTime(time)}</div>
              <div className="text-sm text-gray-600">
                {isAvailable ? 'Available' : 'Booked'}
              </div>
            </button>
          );
        })}
      </div>
      <button
        onClick={prevStep}
        className="mt-6 text-gray-600 hover:text-gray-800 font-medium"
      >
        ← Back to tutors
      </button>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="max-w-md mx-auto">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Tell us about yourself</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Full Name</label>
          <input
            type="text"
            value={formData.studentName}
            onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="your.email@melroseschools.com"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => {
              const formatted = formatPhoneNumber(e.target.value);
              setFormData(prev => ({ ...prev, phone: formatted }));
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="(781) 555-0123"
            maxLength={14}
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Grade Level</label>
          <select
            value={formData.grade}
            onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            <option value="">Select Grade</option>
            <option value="9th Grade">9th Grade</option>
            <option value="10th Grade">10th Grade</option>
            <option value="11th Grade">11th Grade</option>
            <option value="12th Grade">12th Grade</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Additional Notes (Optional)</label>
          <textarea
            value={formData.additionalNotes}
            onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            rows={3}
            placeholder="Any specific topics or concerns..."
          />
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          className="text-gray-600 hover:text-gray-800 font-medium"
        >
          ← Back
        </button>
        <button
          onClick={nextStep}
          disabled={!formData.studentName || !formData.email || !formData.grade}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            formData.studentName && formData.email && formData.grade
              ? 'bg-gray-800 text-white hover:bg-gray-900'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderConfirmStep = () => {
    const selectedTutorData = Array.isArray(tutors) ? tutors.find(t => t.id === selectedTutor) : null;

    return (
      <div className="max-w-md mx-auto text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Confirm Your Appointment</h3>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="space-y-3 text-left">
            <div><strong>Subject:</strong> {selectedSubject}</div>
            <div><strong>Class:</strong> {selectedClass}</div>
            <div><strong>Level:</strong> {selectedLevel}</div>
            <div><strong>Day:</strong> {days.find(d => d.value === selectedDay)?.label}</div>
            <div><strong>Time:</strong> {formatTime(selectedTime)}</div>
            <div><strong>Tutor:</strong> {selectedTutorData?.name}</div>
            <div><strong>Student:</strong> {formData.studentName}</div>
            <div><strong>Grade:</strong> {formData.grade}</div>
          </div>
        </div>

        {submitMessage && (
          <div className={`p-4 rounded-lg mb-4 ${
            submitMessage.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="font-medium">{submitMessage.text}</p>
          </div>
        )}

        {/* Cloudflare Turnstile Captcha */}
        <div className="mb-6 flex justify-center">
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
            onSuccess={(token) => setCaptchaToken(token)}
            onError={() => setCaptchaToken(null)}
            onExpire={() => setCaptchaToken(null)}
          />
        </div>

        <div className="flex justify-between">
          <button
            onClick={prevStep}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Back
          </button>
          <button
            onClick={() => captchaToken && handleSubmit(captchaToken)}
            disabled={isSubmitting || !captchaToken}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              isSubmitting || !captchaToken
                ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Booking...
              </span>
            ) : !captchaToken ? (
              'Complete Captcha'
            ) : (
              'Book Appointment'
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderClassStep = () => (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Which {selectedSubject} class?</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
        {availableClasses.map((className) => (
          <button
            key={className}
            onClick={() => handleClassSelect(className)}
            className="p-6 rounded-xl bg-gray-100 hover:bg-gray-200 border-2 border-transparent hover:border-gray-300 transition-all duration-200 hover:scale-105"
          >
            <div className="text-lg font-bold text-gray-800">{className}</div>
          </button>
        ))}
      </div>
      <button
        onClick={prevStep}
        className="mt-6 text-gray-600 hover:text-gray-800 font-medium"
      >
        ← Back to subjects
      </button>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'subject':
        return renderSubjectStep();
      case 'class':
        return renderClassStep();
      case 'level':
        return renderLevelStep();
      case 'day':
        return renderDayStep();
      case 'tutor':
        return renderTutorStep();
      case 'time':
        return renderTimeStep();
      case 'details':
        return renderDetailsStep();
      case 'confirm':
        return renderConfirmStep();
      default:
        return renderSubjectStep();
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200">
        {renderStepIndicator()}
        <div className="p-8">
          {renderCurrentStep()}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-6 py-4 rounded-lg shadow-lg border ${
            toastType === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              <span className="text-lg mr-2">
                {toastType === 'success' ? '✅' : '❌'}
              </span>
              <span className="font-medium">{toastMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Book Another Modal */}
      {showBookAnother && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Great! Your appointment is booked.</h3>
            <p className="text-gray-600 mb-6">Would you like to book another appointment?</p>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowBookAnother(false);
                  setCurrentStep('subject');
                }}
                className="flex-1 bg-gray-800 text-white py-3 px-6 rounded-lg hover:bg-gray-900 transition-colors"
              >
                Yes, book another
              </button>
              <button
                onClick={() => setShowBookAnother(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
              >
                No, I&apos;m done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}