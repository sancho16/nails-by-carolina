// Booking System
let currentDate = new Date(2026, 1, 15); // February 15, 2026
let selectedDate = null;
let selectedTime = null;

// Available time slots
const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

// Simulated booked appointments (in real app, this would come from database)
const bookedSlots = {
    '2026-02-16': ['10:00 AM', '2:00 PM'],
    '2026-02-17': ['11:00 AM', '3:00 PM'],
    '2026-02-18': ['9:00 AM', '1:00 PM', '4:00 PM']
};

// Initialize calendar
function initCalendar() {
    renderCalendar();
    renderTimeSlots();
}

// Render calendar
function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthYear = document.getElementById('currentMonth');
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    monthYear.textContent = `${monthNames[month]} ${year}`;
    
    // Clear grid
    grid.innerHTML = '';
    
    // Add day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        const header = document.createElement('div');
        header.style.fontWeight = 'bold';
        header.style.textAlign = 'center';
        header.style.padding = '10px 0';
        header.style.color = '#666';
        header.textContent = day;
        grid.appendChild(header);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date(2026, 1, 15); // Current date
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        grid.appendChild(empty);
    }
    
    // Add days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.innerHTML = `<span>${day}</span>`;
        
        const cellDate = new Date(year, month, day);
        
        // Check if today
        if (cellDate.toDateString() === today.toDateString()) {
            dayCell.classList.add('today');
        }
        
        // Disable past dates
        if (cellDate < today) {
            dayCell.classList.add('disabled');
        } else {
            dayCell.addEventListener('click', () => selectDate(year, month, day));
        }
        
        // Check if selected
        if (selectedDate && 
            cellDate.toDateString() === selectedDate.toDateString()) {
            dayCell.classList.add('selected');
        }
        
        grid.appendChild(dayCell);
    }
}

// Select date
function selectDate(year, month, day) {
    selectedDate = new Date(year, month, day);
    selectedTime = null;
    
    const dateStr = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('selectedDate').value = dateStr;
    renderCalendar();
    renderTimeSlots();
}

// Render time slots
function renderTimeSlots() {
    const container = document.getElementById('timeSlots');
    container.innerHTML = '';
    
    if (!selectedDate) {
        container.innerHTML = '<p style="color: #999; text-align: center; grid-column: 1/-1;">Please select a date first</p>';
        return;
    }
    
    const dateKey = selectedDate.toISOString().split('T')[0];
    const booked = bookedSlots[dateKey] || [];
    
    timeSlots.forEach(time => {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.textContent = time;
        
        if (booked.includes(time)) {
            slot.classList.add('booked');
            slot.title = 'Already booked';
        } else {
            slot.addEventListener('click', () => selectTime(time, slot));
        }
        
        if (selectedTime === time) {
            slot.classList.add('selected');
        }
        
        container.appendChild(slot);
    });
}

// Select time
function selectTime(time, element) {
    selectedTime = time;
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    element.classList.add('selected');
}

// Navigation
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Submit booking
document.getElementById('submitBooking').addEventListener('click', () => {
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const email = document.getElementById('clientEmail').value;
    const service = document.getElementById('serviceSelect').value;
    
    if (!selectedDate || !selectedTime) {
        alert('Please select a date and time');
        return;
    }
    
    if (!name || !phone || !email || !service) {
        alert('Please fill in all required fields');
        return;
    }
    
    // In real app, this would send to backend
    const booking = {
        date: selectedDate.toISOString(),
        time: selectedTime,
        name,
        phone,
        email,
        service,
        requests: document.getElementById('specialRequests').value
    };
    
    console.log('Booking submitted:', booking);
    
    // Save to localStorage (simulating database)
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    // Show success
    document.getElementById('bookingOverlay').style.display = 'none';
    document.getElementById('successModal').classList.add('show');
});

// Close success modal
document.getElementById('okBtn').addEventListener('click', () => {
    document.getElementById('successModal').classList.remove('show');
    window.location.reload();
});

// Close booking modal
document.getElementById('closeBooking').addEventListener('click', () => {
    window.parent.postMessage('closeBooking', '*');
});

// Initialize
initCalendar();
