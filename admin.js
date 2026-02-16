// Logout functionality
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('adminAuthenticated');
        sessionStorage.removeItem('adminLoginTime');
        window.location.href = 'admin-login.html';
    }
});

// Sample data
const appointments = [
    { time: '9:00 AM', duration: '60 min', client: 'Sarah Johnson', service: 'Gel Manicure', status: 'confirmed' },
    { time: '10:30 AM', duration: '90 min', client: 'Emily Davis', service: 'Mani + Pedi Combo', status: 'confirmed' },
    { time: '1:00 PM', duration: '60 min', client: 'Jessica Martinez', service: 'Nail Art Design', status: 'pending' },
    { time: '2:30 PM', duration: '75 min', client: 'Amanda Wilson', service: 'Luxury Pedicure', status: 'confirmed' },
    { time: '4:00 PM', duration: '60 min', client: 'Lisa Anderson', service: 'Classic Manicure', status: 'confirmed' }
];

const activities = [
    { icon: '✅', bg: '#e8f5e9', text: 'New appointment booked by Sarah Johnson', time: '5 minutes ago' },
    { icon: '💰', bg: '#fff9e6', text: 'Payment received - $65 from Emily Davis', time: '1 hour ago' },
    { icon: '⭐', bg: '#e3f2fd', text: 'New 5-star review from Jessica Martinez', time: '2 hours ago' },
    { icon: '📧', bg: '#fce4ec', text: 'Reminder sent to Amanda Wilson', time: '3 hours ago' },
    { icon: '👤', bg: '#f3e5f5', text: 'New client registered - Lisa Anderson', time: '5 hours ago' }
];

// Render appointments
function renderAppointments() {
    const container = document.getElementById('appointmentsList');
    if (!container) return;
    
    container.innerHTML = appointments.map(apt => `
        <div class="appointment-item">
            <div class="appointment-time">
                <div class="time">${apt.time}</div>
                <div class="duration">${apt.duration}</div>
            </div>
            <div class="appointment-details">
                <h4>${apt.client}</h4>
                <p>${apt.service}</p>
            </div>
            <div class="appointment-status ${apt.status}">
                ${apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
            </div>
        </div>
    `).join('');
}

// Render activities
function renderActivities() {
    const container = document.getElementById('activityList');
    if (!container) return;
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon" style="background: ${activity.bg}">
                ${activity.icon}
            </div>
            <div class="activity-content">
                <p>${activity.text}</p>
                <span>${activity.time}</span>
            </div>
        </div>
    `).join('');
}

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active state
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Update page title
        const page = item.dataset.page;
        const titles = {
            dashboard: 'Dashboard',
            appointments: 'Appointments',
            clients: 'Clients',
            calendar: 'Calendar',
            services: 'Services',
            settings: 'Settings'
        };
        
        document.getElementById('pageTitle').textContent = titles[page];
        
        // Close mobile menu if open
        if (window.innerWidth <= 1024) {
            document.querySelector('.sidebar').classList.remove('mobile-open');
        }
    });
});

// Mobile menu toggle
const createMobileToggle = () => {
    if (document.querySelector('.mobile-menu-toggle')) return;
    
    const toggle = document.createElement('button');
    toggle.className = 'mobile-menu-toggle';
    toggle.innerHTML = '☰';
    toggle.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('mobile-open');
        toggle.innerHTML = sidebar.classList.contains('mobile-open') ? '✕' : '☰';
    });
    
    document.body.appendChild(toggle);
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderAppointments();
    renderActivities();
    createMobileToggle();
    
    // Load bookings from localStorage
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    console.log('Total bookings:', bookings.length);
});

// Handle window resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 1024) {
            document.querySelector('.sidebar').classList.remove('mobile-open');
            const toggle = document.querySelector('.mobile-menu-toggle');
            if (toggle) toggle.innerHTML = '☰';
        }
    }, 250);
});
