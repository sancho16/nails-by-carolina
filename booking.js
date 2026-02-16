// Booking System with Haptic Feedback
let currentStep = 1;
let selectedDate = null;
let selectedTime = null;
let selectedService = null;
let selectedPrice = 0;

// Haptic feedback function
function triggerHaptic(type = 'light') {
    if ('vibrate' in navigator) {
        switch(type) {
            case 'light':
                navigator.vibrate(10);
                break;
            case 'medium':
                navigator.vibrate(20);
                break;
            case 'heavy':
                navigator.vibrate([30, 10, 30]);
                break;
            case 'success':
                navigator.vibrate([50, 30, 50, 30, 100]);
                break;
        }
    }
}

// Generate dates (next 30 days)
function generateDates() {
    const track = document.getElementById('dateTrack');
    const today = new Date(2026, 1, 15); // February 15, 2026
    
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const item = document.createElement('div');
        item.className = 'scroller-item date-item';
        if (i === 0) item.classList.add('disabled');
        
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        item.innerHTML = `
            <div class="date-day">${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}</div>
            <div class="date-number">${date.getDate()}</div>
        `;
        
        item.dataset.date = date.toISOString().split('T')[0];
        item.dataset.display = `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        
        item.addEventListener('click', () => selectDate(item));
        track.appendChild(item);
    }
}

// Generate time slots
function generateTimeSlots() {
    const track = document.getElementById('timeTrack');
    const times = [
        '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
        '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
        '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
    ];
    
    // Simulate some booked slots
    const bookedSlots = ['10:00 AM', '2:00 PM', '4:00 PM'];
    
    times.forEach(time => {
        const item = document.createElement('div');
        item.className = 'scroller-item time-item';
        if (bookedSlots.includes(time)) {
            item.classList.add('disabled');
        }
        
        item.textContent = time;
        item.dataset.time = time;
        
        item.addEventListener('click', () => selectTime(item));
        track.appendChild(item);
    });
}

// Select date
function selectDate(element) {
    if (element.classList.contains('disabled')) return;
    
    triggerHaptic('medium');
    
    document.querySelectorAll('.date-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    element.classList.add('selected');
    selectedDate = element.dataset.date;
    
    document.getElementById('selectedDateDisplay').textContent = element.dataset.display;
    
    // Scroll to center
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Select time
function selectTime(element) {
    if (element.classList.contains('disabled')) return;
    
    triggerHaptic('medium');
    
    document.querySelectorAll('.time-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    element.classList.add('selected');
    selectedTime = element.dataset.time;
    
    document.getElementById('selectedTimeDisplay').textContent = selectedTime;
    
    // Scroll to center
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Service selection
document.querySelectorAll('.service-option').forEach(option => {
    option.addEventListener('click', function() {
        triggerHaptic('medium');
        
        document.querySelectorAll('.service-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        this.classList.add('selected');
        selectedService = this.dataset.service;
        selectedPrice = this.dataset.price;
        
        // Update summary
        document.getElementById('summaryService').textContent = this.querySelector('h4').textContent;
        document.getElementById('summaryPrice').textContent = '$' + selectedPrice;
    });
});

// Step navigation
function goToStep(step) {
    triggerHaptic('light');
    
    // Update step indicators
    document.querySelectorAll('.step').forEach((s, index) => {
        if (index + 1 <= step) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });
    
    // Update content
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`step${step}`).classList.add('active');
    
    currentStep = step;
    
    // Update summary if going to step 3
    if (step === 3) {
        document.getElementById('summaryDate').textContent = 
            document.getElementById('selectedDateDisplay').textContent;
        document.getElementById('summaryTime').textContent = selectedTime || '-';
    }
}

// Next Step 1
document.getElementById('nextStep1').addEventListener('click', () => {
    if (!selectedDate || !selectedTime) {
        triggerHaptic('heavy');
        alert('Please select both date and time');
        return;
    }
    goToStep(2);
});

// Next Step 2
document.getElementById('nextStep2').addEventListener('click', () => {
    if (!selectedService) {
        triggerHaptic('heavy');
        alert('Please select a service');
        return;
    }
    goToStep(3);
});

// Back buttons
document.getElementById('backStep2').addEventListener('click', () => goToStep(1));
document.getElementById('backStep3').addEventListener('click', () => goToStep(2));

// Submit booking
document.getElementById('submitBooking').addEventListener('click', () => {
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const email = document.getElementById('clientEmail').value;
    
    if (!name || !phone || !email) {
        triggerHaptic('heavy');
        alert('Please fill in all required fields');
        return;
    }
    
    triggerHaptic('success');
    
    // Save booking
    const booking = {
        date: selectedDate,
        time: selectedTime,
        service: selectedService,
        price: selectedPrice,
        name,
        phone,
        email,
        requests: document.getElementById('specialRequests').value,
        timestamp: new Date().toISOString()
    };
    
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    // Show success modal
    document.getElementById('confirmDate').textContent = 
        document.getElementById('selectedDateDisplay').textContent;
    document.getElementById('confirmTime').textContent = selectedTime;
    
    document.getElementById('bookingOverlay').style.display = 'none';
    document.getElementById('successModal').classList.add('show');
});

// Close booking
document.getElementById('closeBooking').addEventListener('click', () => {
    triggerHaptic('light');
    window.parent.postMessage('closeBooking', '*');
});

// Done button
document.getElementById('doneBtn').addEventListener('click', () => {
    triggerHaptic('light');
    document.getElementById('successModal').classList.remove('show');
    window.parent.postMessage('closeBooking', '*');
});

// Smooth scroll on scroller interaction
function setupSmoothScroll(scrollerId) {
    const scroller = document.getElementById(scrollerId);
    let isScrolling;
    
    scroller.addEventListener('scroll', () => {
        clearTimeout(isScrolling);
        
        isScrolling = setTimeout(() => {
            const items = scroller.querySelectorAll('.scroller-item:not(.disabled)');
            let closestItem = null;
            let closestDistance = Infinity;
            
            items.forEach(item => {
                const rect = item.getBoundingClientRect();
                const scrollerRect = scroller.getBoundingClientRect();
                const itemCenter = rect.top + rect.height / 2;
                const scrollerCenter = scrollerRect.top + scrollerRect.height / 2;
                const distance = Math.abs(itemCenter - scrollerCenter);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestItem = item;
                }
            });
            
            if (closestItem && closestDistance < 100) {
                triggerHaptic('light');
                closestItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 150);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    generateDates();
    generateTimeSlots();
    setupSmoothScroll('dateTrack');
    setupSmoothScroll('timeTrack');
});

// Prevent body scroll when modal is open
document.body.style.overflow = 'hidden';
