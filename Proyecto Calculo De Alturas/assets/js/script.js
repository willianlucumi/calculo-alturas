// Script verdadero 
// Selección de elementos del DOM
document.addEventListener('DOMContentLoaded', () => {
    // Botones principales
    const btnIniciarSesion = document.getElementById("btn__iniciar-sesion");
    const btnRegistrarse = document.getElementById("btn__registrarse");
    const themeToggle = document.getElementById("theme-toggle");
    
    // Formularios
    const formularioLogin = document.querySelector(".formulario__login");
    const formularioRegister = document.querySelector(".formulario__register");
    const recoveryForm = document.getElementById("recovery-form");
    
    // Contenedores
    const contenedorLoginRegister = document.querySelector(".contenedor__login-register");
    const cajaTraseraLogin = document.querySelector(".caja__trasera-login");
    const cajaTraseraRegister = document.querySelector(".caja__trasera-register");
    
    // Modal
    const twoFactorModal = document.getElementById("twoFactorModal");
    
    // Event Listeners
    btnIniciarSesion.addEventListener("click", iniciarSesion);
    btnRegistrarse.addEventListener("click", register);
    window.addEventListener("resize", ajustarInterfaz);
    themeToggle.addEventListener("click", toggleTheme);
    
    // Inicialización
    ajustarInterfaz();
    
    // Funciones para manejo de interfaz responsive
    function ajustarInterfaz() {
        if (window.innerWidth > 850) {
            // Vista desktop
            cajaTraseraRegister.style.display = "block";
            cajaTraseraLogin.style.display = "block";
            
            // Ajustar según el formulario activo
            if (formularioLogin.style.display === "block" || formularioLogin.style.display === "") {
                contenedorLoginRegister.style.left = "10px";
                cajaTraseraRegister.style.opacity = "1";
                cajaTraseraLogin.style.opacity = "0";
            } else {
                contenedorLoginRegister.style.left = "410px";
                cajaTraseraRegister.style.opacity = "0";
                cajaTraseraLogin.style.opacity = "1";
            }
        } else {
            // Vista mobile
            if (formularioLogin.style.display === "block" || formularioLogin.style.display === "") {
                cajaTraseraRegister.style.display = "block";
                cajaTraseraRegister.style.opacity = "1";
                cajaTraseraLogin.style.display = "none";
                formularioLogin.style.display = "block";
                formularioRegister.style.display = "none";
                recoveryForm.style.display = "none";
            } else {
                cajaTraseraRegister.style.display = "none";
                cajaTraseraLogin.style.display = "block";
                cajaTraseraLogin.style.opacity = "1";
                formularioLogin.style.display = "none";
                formularioRegister.style.display = "block";
                recoveryForm.style.display = "none";
            }
            contenedorLoginRegister.style.left = "0px";
        }
        const formHeight = document.querySelector('.contenedor__login-register form:not([style*="display: none"])').offsetHeight;
    document.querySelector('.contenedor__todo').style.minHeight = (formHeight + 200) + 'px';
}

    function iniciarSesion() {
        formularioLogin.style.display = "block";
        formularioRegister.style.display = "none";
        recoveryForm.style.display = "none";
        
        if (window.innerWidth > 850) {
            contenedorLoginRegister.style.left = "10px";
            cajaTraseraRegister.style.opacity = "1";
            cajaTraseraLogin.style.opacity = "0";
        } else {
            contenedorLoginRegister.style.left = "0px";
            cajaTraseraRegister.style.display = "block";
            cajaTraseraLogin.style.display = "none";
        }
    }

    function register() {
        formularioRegister.style.display = "block";
        formularioLogin.style.display = "none";
        recoveryForm.style.display = "none";
        
        if (window.innerWidth > 850) {
            contenedorLoginRegister.style.left = "410px";
            cajaTraseraRegister.style.opacity = "0";
            cajaTraseraLogin.style.opacity = "1";
        } else {
            contenedorLoginRegister.style.left = "0px";
            cajaTraseraRegister.style.display = "none";
            cajaTraseraLogin.style.display = "block";
        }
    }
});

// Funcionalidad de tema oscuro
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-toggle i');
    
    body.classList.toggle('dark-mode');
    
    // Cambiar el icono según el tema
    if (body.classList.contains('dark-mode')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
    }
}

// Cargar tema guardado
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.querySelector('.theme-toggle i').classList.remove('fa-moon');
        document.querySelector('.theme-toggle i').classList.add('fa-sun');
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', loadSavedTheme);

// Mostrar/ocultar contraseña
function togglePassword(inputId, element) {
    const input = document.getElementById(inputId);
    const icon = element.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Verificar fortaleza de contraseña
function checkPasswordStrength() {
    const password = document.getElementById('register-password').value;
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    
    // Criterios de evaluación
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;
    
    // Calcular puntuación (0-100)
    let strength = 0;
    if (password.length > 0) strength += 20;
    if (hasLowerCase) strength += 20;
    if (hasUpperCase) strength += 20;
    if (hasNumber) strength += 20;
    if (hasSpecialChar) strength += 20;
    if (!isLongEnough) strength = Math.min(strength, 40);
    
    // Actualizar barra de progreso
    strengthBar.style.width = strength + '%';
    
    // Establecer color según fortaleza
    if (strength < 40) {
        strengthBar.style.backgroundColor = 'var(--error-color)';
        strengthText.innerHTML = 'Fuerza: Débil';
    } else if (strength < 80) {
        strengthBar.style.backgroundColor = 'var(--warning-color)';
        strengthText.innerHTML = 'Fuerza: Media';
    } else {
        strengthBar.style.backgroundColor = 'var(--success-color)';
        strengthText.innerHTML = 'Fuerza: Fuerte';
    }
}

// Mostrar formulario de recuperación
function showRecoveryForm() {
    document.querySelector('.formulario__login').style.display = 'none';
    document.querySelector('.formulario__register').style.display = 'none';
    document.getElementById('recovery-form').style.display = 'block';
}

// Mostrar formulario de login desde recuperación
function showLoginForm() {
    document.getElementById('recovery-form').style.display = 'none';
    document.querySelector('.formulario__login').style.display = 'block';
}

// Gestión del modal de autenticación de dos factores
function showTwoFactorModal() {
    const modal = document.getElementById('twoFactorModal');
    modal.style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function moveToNext(field, index) {
    // Mover al siguiente campo en la verificación OTP
    if (field.value.length >= field.maxLength) {
        const inputs = document.querySelectorAll('.otp-input');
        if (index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    }
}

function verifyOTP() {
    // Simulación de verificación OTP
    const inputs = document.querySelectorAll('.otp-input');
    let code = '';
    
    inputs.forEach(input => {
        code += input.value;
    });
    
    if (code.length === 6) {
        // Código de ejemplo - En una implementación real, verificaríamos con el servidor
        if (code === '123456') {
            showToast('Código verificado correctamente', 'success');
            closeModal('twoFactorModal');
            // Aquí redirigiríamos al panel principal en una aplicación real
        } else {
            showToast('Código incorrecto', 'error');
        }
    } else {
        showToast('Por favor, ingresa el código completo', 'warning');
    }
}

function resendOTP() {
    // Simulación de reenvío del código
    showToast('Se ha enviado un nuevo código a tu correo', 'success');
}

// Simulación de login
function simulateLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const loginBtn = document.getElementById('login-btn');
    
    // Validación básica
    if (!email || !password) {
        showToast('Por favor, completa todos los campos', 'warning');
        return;
    }
    
    // Mostrar spinner de carga
    loginBtn.classList.add('loading');
    
    // Crear objeto FormData para enviar datos
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    
    // Realizar petición al servidor
    fetch('login.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        loginBtn.classList.remove('loading');
        
        if (data.status === 'success') {
            if (data.require_2fa) {
                // Guardar usuario_id para verificación posterior
                sessionStorage.setItem('temp_usuario_id', data.usuario_id);
                showTwoFactorModal();
                showToast('Se requiere verificación en dos pasos', 'info');
            } else {
                showToast('Inicio de sesión exitoso', 'success');
                // Redirigir al panel principal
                setTimeout(() => {
                    window.location.href = 'dashboard.php';
                }, 1000);
            }
        } else {
            showToast(data.message, 'error');
        }
    })
    .catch(error => {
        loginBtn.classList.remove('loading');
        showToast('Error al conectar con el servidor', 'error');
        console.error('Error:', error);
    });
}

// Simulación de registro
function simulateRegister() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const enable2FA = document.getElementById('enable-2fa').checked;
    const registerBtn = document.getElementById('register-btn');
    
    // Validación básica
    if (!name || !email || !username || !password) {
        showToast('Por favor, completa todos los campos', 'warning');
        return;
    }
    
    // Validación de fortaleza de contraseña
    const strengthBar = document.getElementById('strength-bar');
    const strengthWidth = parseInt(strengthBar.style.width);
    
    if (strengthWidth < 60) {
        showToast('Por favor, utiliza una contraseña más segura', 'warning');
        return;
    }
    
    // Mostrar spinner de carga
    registerBtn.classList.add('loading');
    
    // Simulación de tiempo de espera para el registro
    setTimeout(() => {
        registerBtn.classList.remove('loading');
        showToast('Cuenta creada correctamente', 'success');
        
        // Si habilitó 2FA, mostrar el modal
        if (enable2FA) {
            showTwoFactorModal();
        } else {
            // Redirigir al login
            iniciarSesion();
        }
    }, 1500);
}

// Simulación de recuperación de contraseña
function simulateRecovery() {
    const email = document.getElementById('recovery-email').value;
    
    if (!email) {
        showToast('Por favor, ingresa tu correo electrónico', 'warning');
        return;
    }
    
    const button = document.querySelector('#recovery-form button');
    button.classList.add('loading');
    
    setTimeout(() => {
        button.classList.remove('loading');
        showToast('Se han enviado instrucciones a tu correo', 'success');
        showLoginForm();
    }, 1500);
}

// Sistema de notificaciones toast
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    
    // Crear elemento toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Agregar contenido
    let icon;
    switch(type) {
        case 'success':
            icon = 'check-circle';
            break;
        case 'error':
            icon = 'times-circle';
            break;
        case 'warning':
            icon = 'exclamation-triangle';
            break;
        default:
            icon = 'info-circle';
    }
    
    toast.innerHTML = `
        <i class="fas fa-${icon} toast-icon"></i>
        <span>${message}</span>
    `;
    
    // Agregar al contenedor
    container.appendChild(toast);
    
    // Mostrar con un pequeño retraso para permitir la animación
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

// Efectos de ripple para botones
document.addEventListener('click', function(e) {
    const target = e.target;
    
    if (target.tagName === 'BUTTON' && !target.classList.contains('social-btn')) {
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        target.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
});