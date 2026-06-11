import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getChildren, getChildSchedule } from '../../services/childService';
import { getAllDoctorsPublic, getAllVaccinesPublic, bookAppointment } from '../../services/adminService';
import { getMyAppointments } from '../../services/appointmentService';
import { FiCalendar, FiUser, FiClock, FiSend, FiLoader, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BookAppointment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [allVaccines, setAllVaccines] = useState([]);
  const [availableVaccines, setAvailableVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [formData, setFormData] = useState({
    childId: '',
    doctorId: '',
    vaccineId: '',
    appointmentDate: new Date(),
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.childId) {
      fetchAvailableVaccines(formData.childId);
      fetchBookedDates(formData.childId);
    } else {
      setAvailableVaccines([]);
      setBookedDates([]);
    }
  }, [formData.childId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      
      console.log('Fetching children for parent...');
      const childrenRes = await getChildren();
      
      let childrenData = [];
      if (childrenRes.data) {
        if (Array.isArray(childrenRes.data)) {
          childrenData = childrenRes.data;
        } else if (typeof childrenRes.data === 'object') {
          if (childrenRes.data.data && Array.isArray(childrenRes.data.data)) {
            childrenData = childrenRes.data.data;
          } else if (childrenRes.data.content && Array.isArray(childrenRes.data.content)) {
            childrenData = childrenRes.data.content;
          } else if (Object.keys(childrenRes.data).length > 0) {
            childrenData = [childrenRes.data];
          }
        }
      }
      setChildren(childrenData);
      
      console.log('Fetching all doctors from public endpoint...');
      const doctorsRes = await getAllDoctorsPublic();
      
      let doctorsData = [];
      if (doctorsRes.data) {
        if (Array.isArray(doctorsRes.data)) {
          doctorsData = doctorsRes.data;
        } else if (typeof doctorsRes.data === 'object') {
          if (doctorsRes.data.data && Array.isArray(doctorsRes.data.data)) {
            doctorsData = doctorsRes.data.data;
          } else if (doctorsRes.data.content && Array.isArray(doctorsRes.data.content)) {
            doctorsData = doctorsRes.data.content;
          } else if (Object.keys(doctorsRes.data).length > 0) {
            doctorsData = [doctorsRes.data];
          }
        }
      }
      setDoctors(doctorsData);
      
      console.log('Fetching all vaccines from public endpoint...');
      const vaccinesRes = await getAllVaccinesPublic();
      
      let vaccinesData = [];
      if (vaccinesRes.data) {
        if (Array.isArray(vaccinesRes.data)) {
          vaccinesData = vaccinesRes.data;
        } else if (typeof vaccinesRes.data === 'object') {
          if (vaccinesRes.data.data && Array.isArray(vaccinesRes.data.data)) {
            vaccinesData = vaccinesRes.data.data;
          } else if (vaccinesRes.data.content && Array.isArray(vaccinesRes.data.content)) {
            vaccinesData = vaccinesRes.data.content;
          } else if (Object.keys(vaccinesRes.data).length > 0) {
            vaccinesData = [vaccinesRes.data];
          }
        }
      }
      setAllVaccines(vaccinesData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setFetchError('Failed to load data. Please try again.');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookedDates = async (childId) => {
    try {
      const response = await getMyAppointments();
      
      let appointments = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          appointments = response.data;
        } else if (typeof response.data === 'object') {
          if (response.data.data && Array.isArray(response.data.data)) {
            appointments = response.data.data;
          } else if (response.data.content && Array.isArray(response.data.content)) {
            appointments = response.data.content;
          }
        }
      }
      
      // Filter appointments for this child and get dates (PENDING or CONFIRMED only)
      const childAppointments = appointments.filter(apt => 
        apt.child?.id?.toString() === childId.toString() && 
        (apt.status === 'PENDING' || apt.status === 'CONFIRMED')
      );
      
      const dates = childAppointments.map(apt => {
        const date = new Date(apt.appointmentDate);
        date.setHours(0, 0, 0, 0);
        return date;
      });
      
      setBookedDates(dates);
      
    } catch (error) {
      console.error('Error fetching booked dates:', error);
    }
  };

  const fetchAvailableVaccines = async (childId) => {
    try {
      console.log('Fetching schedule for child:', childId);
      const scheduleRes = await getChildSchedule(childId);
      
      let schedule = [];
      if (scheduleRes.data) {
        if (Array.isArray(scheduleRes.data)) {
          schedule = scheduleRes.data;
        } else if (typeof scheduleRes.data === 'object') {
          if (scheduleRes.data.data && Array.isArray(scheduleRes.data.data)) {
            schedule = scheduleRes.data.data;
          } else if (scheduleRes.data.content && Array.isArray(scheduleRes.data.content)) {
            schedule = scheduleRes.data.content;
          }
        }
      }
      
      // Get IDs of pending/overdue vaccines (vaccines that need to be done)
      const pendingVaccineIds = schedule
        .filter(item => item.status === 'PENDING' || item.status === 'OVERDUE')
        .map(item => item.vaccine?.id)
        .filter(id => id != null);
      
      // Filter to show only pending/available vaccines
      const available = allVaccines.filter(vaccine => 
        pendingVaccineIds.includes(vaccine.id)
      );
      
      setAvailableVaccines(available);
      
      // Reset vaccine selection if current selection is no longer available
      if (formData.vaccineId && !available.some(v => v.id.toString() === formData.vaccineId.toString())) {
        setFormData(prev => ({ ...prev, vaccineId: '' }));
      }
      
    } catch (error) {
      console.error('Error fetching available vaccines:', error);
      toast.error('Failed to load available vaccines');
      setAvailableVaccines([]);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.childId || !formData.doctorId || !formData.vaccineId) {
    toast.error('Please select child, doctor, and vaccine');
    return;
  }
  
  // Get the selected date and time
  const selectedDate = formData.appointmentDate;
  console.log('Original selected time:', selectedDate.toLocaleTimeString());
  console.log('Hours:', selectedDate.getHours());
  console.log('Minutes:', selectedDate.getMinutes());
  
  // Create a new date object
  const appointmentDate = new Date(selectedDate);
  
  // Validate date is not in the past
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const selectedDay = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
  
  if (selectedDay < today) {
    toast.error('Appointment date cannot be in the past');
    return;
  }
  
  // Check if date is already booked
  const isDateBooked = bookedDates.some(date => {
    const bookedDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return bookedDay.getTime() === selectedDay.getTime();
  });
  
  if (isDateBooked) {
    toast.error('This date is already booked for the selected child');
    return;
  }
  
  // Check if time is in the past for today
  if (selectedDay.getTime() === today.getTime() && appointmentDate < now) {
    toast.error('Appointment time cannot be in the past');
    return;
  }
  
  try {
    setSubmitting(true);
    
    // Create a date string in local format YYYY-MM-DDTHH:MM:SS
    const year = appointmentDate.getFullYear();
    const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
    const day = String(appointmentDate.getDate()).padStart(2, '0');
    const hours = String(appointmentDate.getHours()).padStart(2, '0');
    const minutes = String(appointmentDate.getMinutes()).padStart(2, '0');
    const seconds = '00';
    
    // Use local date format without Z or timezone
    const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    
    console.log('Sending local date time:', localDateTime);
    console.log('Hours being sent:', hours);
    console.log('Minutes being sent:', minutes);
    
    const bookingData = {
      childId: parseInt(formData.childId),
      doctorId: parseInt(formData.doctorId),
      vaccineId: parseInt(formData.vaccineId),
      appointmentDate: localDateTime,
      notes: formData.notes || ''
    };
    
    const response = await bookAppointment(bookingData);
    
    if (response.data && response.data.success) {
      toast.success('Appointment booked successfully!');
      
      // Reset form
      setFormData({
        childId: '',
        doctorId: '',
        vaccineId: '',
        appointmentDate: new Date(),
        notes: ''
      });
      setAvailableVaccines([]);
      setBookedDates([]);
      
      setTimeout(() => {
        navigate('/parent/my-appointments');
      }, 2000);
    } else {
      toast.error(response.data?.message || 'Failed to book appointment');
    }
    
  } catch (error) {
    console.error('Error booking appointment:', error);
    toast.error(error.response?.data?.message || 'Failed to book appointment');
  } finally {
    setSubmitting(false);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Check if a date is booked
  const isDateBooked = (date) => {
    if (!formData.childId) return false;
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    return bookedDates.some(bookedDate => 
      bookedDate.getTime() === checkDate.getTime()
    );
  };

  // Filter dates - allow all future dates including weekends, but disable booked dates
  const filterDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    // Allow all future dates (including weekends)
    const isFutureOrToday = checkDate >= today;
    
    // Disable if booked
    const isBooked = isDateBooked(date);
    
    return isFutureOrToday && !isBooked;
  };

  // Filter time slots (9 AM to 5 PM) - keep business hours - this time modified into 24 hours if you want the business timing to change the below return code
  //return hours >= 9 && hours < 17;
  // Filter time slots (24 hours)
  const filterTime = (time) => {
    const hours = time.getHours();
    return hours >= 0 && hours < 24;
  };

  // Custom day class name for booked dates
  const getDayClassName = (date) => {
    if (isDateBooked(date)) {
      return 'booked-date';
    }
    return '';
  };
// Helper to get tomorrow's date (start of day)
const getTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading booking form...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FiAlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
        <p className="text-red-600 dark:text-red-400 mb-4">{fetchError}</p>
        <button
          onClick={fetchData}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Book Appointment</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Schedule a vaccination appointment with a doctor</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Child Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Child <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <select
                name="childId"
                value={formData.childId}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white appearance-none"
                required
              >
                <option value="">-- Choose a child --</option>
                {children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name} (DOB: {new Date(child.dob).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
            {children.length === 0 && (
              <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                No children found. Please add a child first.
              </p>
            )}
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Doctor <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white appearance-none"
                required
              >
                <option value="">-- Choose a doctor --</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.name} - {doctor.specialization || 'General Physician'} 
                    {doctor.experience ? ` (${doctor.experience} years exp.)` : ''}
                  </option>
                ))}
              </select>
            </div>
            {doctors.length === 0 && (
              <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                No doctors available at the moment.
              </p>
            )}
          </div>

          {/* Vaccine Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Vaccine <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiClock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <select
                name="vaccineId"
                value={formData.vaccineId}
                onChange={handleChange}
                disabled={!formData.childId}
                className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                required
              >
                <option value="">
                  {!formData.childId 
                    ? '-- Select a child first --' 
                    : availableVaccines.length === 0 
                      ? '-- No vaccines available --' 
                      : '-- Choose a vaccine --'}
                </option>
                {availableVaccines.map(vaccine => (
                  <option key={vaccine.id} value={vaccine.id}>
                    {vaccine.name} (Due at {vaccine.ageInMonths} months)
                  </option>
                ))}
              </select>
            </div>
            {formData.childId && availableVaccines.length === 0 && allVaccines.length > 0 && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                All vaccinations are completed for this child! 🎉
              </p>
            )}
          </div>

          {/* Appointment Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Appointment Date & Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <FiCalendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <DatePicker
  selected={formData.appointmentDate}
  onChange={(date) => {
    console.log('DatePicker raw selected:', date);
    console.log('Local time:', date.toString());
    console.log('Hours:', date.getHours());
    console.log('Minutes:', date.getMinutes());
    setFormData(prev => ({ ...prev, appointmentDate: date }));
  }}
  showTimeSelect
  timeFormat="HH:mm"
  timeIntervals={30}
  dateFormat="MMMM d, yyyy h:mm aa"
  //minDate={new Date()}
  minDate={getTomorrow()}
  filterDate={filterDate}
  filterTime={filterTime}
  dayClassName={getDayClassName}
  className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
  required
  placeholderText="Select date and time"
  utcOffset={0} // Don't use UTC offset
  timeCaption="Time"
/>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {/*Available: 9:00 AM - 5:00 PM, any day of the week*/}
              Available: 24 Hours, any day of the week
              {formData.childId && bookedDates.length > 0 && (
                <span className="block mt-1 text-amber-600 dark:text-amber-400">
                  ⚠ Dates with existing appointments are disabled
                </span>
              )}
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
              placeholder="Any special requests or notes for the doctor..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !formData.childId || !formData.doctorId || !formData.vaccineId}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 dark:bg-primary-500 dark:hover:bg-primary-600 dark:disabled:bg-primary-300 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg font-medium disabled:cursor-not-allowed mt-8"
          >
            {submitting ? (
              <>
                <FiLoader className="h-5 w-5 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <FiSend className="h-5 w-5" />
                Book Appointment
              </>
            )}
          </button>
        </form>

        {/* Summary */}
        {formData.childId && formData.doctorId && formData.vaccineId && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Appointment Summary</h3>
            <div className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
              <p><span className="font-medium">Child:</span> {children.find(c => c.id.toString() === formData.childId.toString())?.name}</p>
              <p><span className="font-medium">Doctor:</span> Dr. {doctors.find(d => d.id.toString() === formData.doctorId.toString())?.name}</p>
              <p><span className="font-medium">Vaccine:</span> {availableVaccines.find(v => v.id.toString() === formData.vaccineId.toString())?.name}</p>
              <p><span className="font-medium">Date & Time:</span> {formData.appointmentDate.toLocaleString()}</p>
              <p><span className="font-medium">Status:</span> <span className="text-yellow-600 font-semibold">Pending</span></p>
            </div>
          </div>
        )}
      </div>

      {/* Add CSS for booked dates styling */}
      <style jsx>{`
        .booked-date {
          background-color: #fecaca !important;
          color: #991b1b !important;
          text-decoration: line-through;
          border-radius: 50%;
        }
        .booked-date:hover {
          background-color: #fca5a5 !important;
        }
      `}</style>
    </div>
  );
};

export default BookAppointment;