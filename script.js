// Booking modal
const openBookingBtn = document.getElementById('openBooking');
const bookingContainer = document.getElementById('bookingModalContainer');

if (openBookingBtn) {
    openBookingBtn.addEventListener('click', () => {
        bookingContainer.classList.add('show');
        document.body.style.overflow = 'hidden';
    });
}

// Listen for close message from iframe
window.addEventListener('message', (event) => {
    if (event.data === 'closeBooking') {
        bookingContainer.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all animated elements
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.image-placeholder, .feature-item, .qr-section');
    animatedElements.forEach(el => observer.observe(el));

    // Add hover effect to checkmarks
    const checkmarks = document.querySelectorAll('.checkmark');
    checkmarks.forEach(checkmark => {
        checkmark.addEventListener('mouseenter', () => {
            checkmark.style.transform = 'rotate(360deg) scale(1.2)';
            checkmark.style.transition = 'transform 0.5s ease';
        });
        
        checkmark.addEventListener('mouseleave', () => {
            checkmark.style.transform = 'rotate(0deg) scale(1)';
        });
    });

    // QR Code click interaction
    const qrCode = document.querySelector('.qr-code');
    if (qrCode) {
        qrCode.addEventListener('click', () => {
            qrCode.style.transform = 'scale(1.1)';
            setTimeout(() => {
                qrCode.style.transform = 'scale(1)';
            }, 200);
        });
    }

    // Animate logo on load
    const logo = document.querySelector('.logo');
    setTimeout(() => {
        logo.style.transform = 'scale(1.1)';
        setTimeout(() => {
            logo.style.transform = 'scale(1)';
        }, 300);
    }, 1000);
});

// Add sparkle effect on mouse move
document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.95) {
        createSparkle(e.clientX, e.clientY);
    }
});

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 4px;
        height: 4px;
        background: radial-gradient(circle, #d4af37, transparent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        animation: sparkleAnimation 1s ease-out forwards;
    `;
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        sparkle.remove();
    }, 1000);
}

// Add sparkle animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkleAnimation {
        0% {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
        100% {
            opacity: 0;
            transform: scale(0) translateY(-30px);
        }
    }
`;
document.head.appendChild(style);
