function toggleService(element) {
    const card = element.closest('.service-card');
    card.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.querySelector('.service-header').addEventListener('click', function(e) {
            e.stopPropagation();
            serviceCards.forEach(otherCard => {
                if (otherCard !== card && otherCard.classList.contains('active')) {
                    otherCard.classList.remove('active');
                }
            });
        });
    });

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const mensajeInput = document.getElementById('mensaje');
        const charCount = document.getElementById('charCount');

        if (mensajeInput && charCount) {
            mensajeInput.addEventListener('input', function() {
                const count = this.value.length;
                charCount.textContent = `${count}/500`;
                
                if (count > 500) {
                    this.value = this.value.substring(0, 500);
                    charCount.textContent = '500/500';
                }
            });
        }

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm()) {
                const successMessage = document.getElementById('successMessage');
                if (successMessage) {
                    successMessage.textContent = '¡Solicitud enviada correctamente! Nos pondremos en contacto pronto.';
                    successMessage.classList.add('show');
                    
                    contactForm.reset();
                    charCount.textContent = '0/500';
                    
                    setTimeout(() => {
                        successMessage.classList.remove('show');
                    }, 5000);
                }
                
                setTimeout(() => {
                    contactForm.submit();
                }, 500);
            }
        });
    }
});

function validateForm() {
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const asunto = document.getElementById('asunto').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();

    let isValid = true;

    if (nombre.length < 3) {
        showError('nombreError', 'El nombre debe tener al menos 3 caracteres');
        isValid = false;
    } else {
        hideError('nombreError');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        showError('correoError', 'Por favor, ingresa un correo válido');
        isValid = false;
    } else {
        hideError('correoError');
    }

    if (asunto.length < 5) {
        showError('asuntoError', 'El asunto debe tener al menos 5 caracteres');
        isValid = false;
    }

    if (mensaje.length < 10) {
        showError('mensajeError', 'El mensaje debe tener al menos 10 caracteres');
        isValid = false;
    }

    return isValid;
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.animation = 'fadeIn 0.6s ease';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-card');
    const teamCards = document.querySelectorAll('.team-card');
    
    serviceCards.forEach(card => observer.observe(card));
    teamCards.forEach(card => observer.observe(card));
});

window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
});

console.log('Script de interactividad cargado correctamente');
