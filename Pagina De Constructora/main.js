import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


let app, db, auth;
let userId;
let isAuthReady = false;


const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;


const authFormsContainer = document.getElementById('auth-forms-container');
const authStatusContainer = document.getElementById('auth-status-container');
const userEmailDisplay = document.getElementById('user-email-display');
const logoutBtn = document.getElementById('logout-btn');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');
const loginMessage = document.getElementById('login-message');
const signupMessage = document.getElementById('signup-message');


const portalSection = document.getElementById('portal');
const portalLink = document.getElementById('portal-link');
const mobilePortalLink = document.getElementById('mobile-portal-link');
const quotesList = document.getElementById('quotes-list');
const exclusiveContentDiv = document.getElementById('exclusive-content');
const saveQuoteBtn = document.getElementById('save-quote-btn');
const budgetResultSpan = document.getElementById('budget-result');

const adminEmailDisplay = document.getElementById('admin-email-display');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const usersListTable = document.getElementById('users-list');
const adminQuotesList = document.getElementById('admin-quotes-list');
const adminFormsList = document.getElementById('admin-forms-list');


const ADMIN_EMAIL = 'admin@tudominio.com';


const updateAuthUI = (user) => {
    if (user && user.isAnonymous === false) {
        // Usuario autenticado con email/password
        userEmailDisplay.textContent = user.email;
        if (authFormsContainer) authFormsContainer.classList.add('hidden');
        if (authStatusContainer) authStatusContainer.classList.remove('hidden');
        
        // Mostrar o no el portal del cliente
        if (portalSection) portalSection.classList.remove('hidden');
        if (portalLink) portalLink.classList.remove('hidden');
        if (mobilePortalLink) mobilePortalLink.classList.remove('hidden');
        if (saveQuoteBtn) saveQuoteBtn.classList.remove('hidden');
        if (exclusiveContentDiv) displayExclusiveContent();
        

        if (user.email === ADMIN_EMAIL && window.location.pathname.endsWith('index.html')) {
            window.location.href = 'admin.html';
        }
    } else {

        if (authFormsContainer) authFormsContainer.classList.remove('hidden');
        if (authStatusContainer) authStatusContainer.classList.add('hidden');
        if (portalSection) portalSection.classList.add('hidden');
        if (portalLink) portalLink.classList.add('hidden');
        if (mobilePortalLink) mobilePortalLink.classList.add('hidden');
        if (saveQuoteBtn) saveQuoteBtn.classList.add('hidden');
    }
};


const displayExclusiveContent = () => {
    exclusiveContentDiv.innerHTML = `
        <p><strong><i class="fas fa-lightbulb text-yellow-500 mr-2"></i>Guía de Materiales Sostenibles:</strong> Descubre los mejores materiales ecológicos para tu proyecto. Desde ladrillos de bambú hasta pinturas sin compuestos volátiles, aprende cómo tu construcción puede ser amigable con el planeta. ¡Reducir tu huella de carbono nunca ha sido tan fácil!</p>
        <p class="mt-4"><strong><i class="fas fa-ruler-combined text-blue-500 mr-2"></i>Checklist de Remodelación:</strong> Antes de empezar cualquier obra, es crucial tener un plan. Usa nuestra lista exclusiva para no olvidar ningún detalle: desde la obtención de permisos, la elección de contratistas, hasta la planificación de la obra. ¡Asegura que tu proyecto sea un éxito de principio a fin!</p>
        <p class="mt-4"><strong><i class="fas fa-shield-alt text-green-500 mr-2"></i>Consejos de Seguridad en Obra:</strong> La seguridad es nuestra prioridad. Te compartimos los 5 puntos clave para mantener un ambiente de trabajo seguro, tanto para profesionales como para proyectos de "hazlo tú mismo".</p>
    `;
};


try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);


    if (initialAuthToken) {
        signInWithCustomToken(auth, initialAuthToken).catch((error) => {
            console.error("Error signing in with custom token:", error);

            signInAnonymously(auth);
        });
    } else {
        signInAnonymously(auth);
    }


    onAuthStateChanged(auth, (user) => {
        if (user) {
            userId = user.uid;
            document.getElementById('user-id-display').textContent = `ID de Usuario: ${userId}`;
            isAuthReady = true;
            updateAuthUI(user);
            

            if (user.isAnonymous === false) {
                const quotesCollection = collection(db, `artifacts/${appId}/users/${userId}/quotes`);
                onSnapshot(quotesCollection, (snapshot) => {
                    if (isAuthReady && quotesList) {
                        quotesList.innerHTML = '';
                        if (snapshot.empty) {
                            quotesList.innerHTML = '<p class="text-gray-500">No tienes cotizaciones guardadas. Usa la calculadora para crear una.</p>';
                            return;
                        }
                        snapshot.forEach((doc) => {
                            const quote = doc.data();
                            const quoteDate = quote.timestamp ? new Date(quote.timestamp.seconds * 1000).toLocaleDateString() : 'N/A';
                            const quoteElement = document.createElement('div');
                            quoteElement.className = 'p-4 bg-gray-100 rounded-lg';
                            quoteElement.innerHTML = `
                                <p class="font-bold">Cotización: ${quote.projectType}</p>
                                <p class="text-sm text-gray-600">Área: ${quote.area} m²</p>
                                <p class="text-sm text-gray-600">Calidad: ${quote.quality}</p>
                                <p class="text-lg font-semibold text-blue-600 mt-2">Costo estimado: ${quote.cost}</p>
                                <p class="text-xs text-gray-500 mt-1">Guardada el: ${quoteDate}</p>
                            `;
                            quotesList.appendChild(quoteElement);
                        });
                    }
                });
            }


            if (window.location.pathname.endsWith('admin.html') && user.email === ADMIN_EMAIL) {
                if (adminEmailDisplay) adminEmailDisplay.textContent = user.email;
                loadAdminData();
            } else if (window.location.pathname.endsWith('admin.html') && user.email !== ADMIN_EMAIL) {
                window.location.href = 'index.html'; // Redirigir si no es admin
            }

        } else {
            console.log('No user signed in.');
            userId = null;
            isAuthReady = true;
            updateAuthUI(null);
            if (window.location.pathname.endsWith('admin.html')) {
                window.location.href = 'index.html'; // Redirigir si no hay sesión
            }
        }
    });

} catch (error) {
    console.error("Firebase initialization or auth failed:", error);
}


async function loadAdminData() {

    if (usersListTable) {
        usersListTable.innerHTML = `
            <tr class="hover:bg-gray-100 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">admin@tudominio.com</td>
                <td class="px-6 py-4 whitespace-nowrap">${auth.currentUser.uid}</td>
                <td class="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">Activo</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-400">Acciones no disponibles en demo</td>
            </tr>
        `;
    }


    if (adminQuotesList) {
        adminQuotesList.innerHTML = '<p class="text-center text-gray-500">Cargando cotizaciones...</p>';
        const usersCollection = collection(db, `artifacts/${appId}/users`);
        const userDocs = await getDocs(usersCollection);
        
        let allQuotes = [];
        for (const userDoc of userDocs.docs) {
            const userQuotesCollection = collection(db, userDoc.ref.path + '/quotes');
            const quotesSnapshot = await getDocs(userQuotesCollection);
            quotesSnapshot.forEach((doc) => {
                allQuotes.push(doc.data());
            });
        }
        
        adminQuotesList.innerHTML = '';
        if (allQuotes.length === 0) {
            adminQuotesList.innerHTML = '<p class="text-center text-gray-500">No hay cotizaciones guardadas.</p>';
        } else {
            allQuotes.forEach((quote) => {
                const quoteDate = quote.timestamp ? new Date(quote.timestamp.seconds * 1000).toLocaleDateString() : 'N/A';
                const quoteElement = document.createElement('div');
                quoteElement.className = 'p-4 bg-gray-100 rounded-lg shadow-inner';
                quoteElement.innerHTML = `
                    <p class="font-bold">Cotización: ${quote.projectType}</p>
                    <p class="text-sm text-gray-600">Área: ${quote.area} m²</p>
                    <p class="text-sm text-gray-600">Calidad: ${quote.quality}</p>
                    <p class="text-lg font-semibold text-blue-600 mt-2">Costo estimado: ${quote.cost}</p>
                    <p class="text-xs text-gray-500 mt-1">Guardada el: ${quoteDate}</p>
                `;
                adminQuotesList.appendChild(quoteElement);
            });
        }
    }


    if (adminFormsList) {
        adminFormsList.innerHTML = '<p class="text-center text-gray-500">Cargando formularios...</p>';
        const usersCollection = collection(db, `artifacts/${appId}/users`);
        const userDocs = await getDocs(usersCollection);
        
        let allForms = [];
        for (const userDoc of userDocs.docs) {
            const userFormsCollection = collection(db, userDoc.ref.path + '/contact_form_submissions');
            const formsSnapshot = await getDocs(userFormsCollection);
            formsSnapshot.forEach((doc) => {
                allForms.push(doc.data());
            });
        }
        
        adminFormsList.innerHTML = '';
        if (allForms.length === 0) {
            adminFormsList.innerHTML = '<p class="text-center text-gray-500">No hay formularios de contacto enviados.</p>';
        } else {
            allForms.forEach((formData) => {
                const formDate = formData.timestamp ? new Date(formData.timestamp.seconds * 1000).toLocaleDateString() : 'N/A';
                const formElement = document.createElement('div');
                formElement.className = 'p-4 bg-gray-100 rounded-lg shadow-inner';
                formElement.innerHTML = `
                    <p class="font-bold">Mensaje de ${formData.email || 'Anónimo'}</p>
                    <p class="text-sm text-gray-600">Nombre: ${formData.name}</p>
                    <p class="text-sm text-gray-600">Teléfono: ${formData.phone || 'N/A'}</p>
                    <p class="text-sm text-gray-600">Mensaje: ${formData.message}</p>
                    <p class="text-xs text-gray-500 mt-1">Enviado el: ${formDate}</p>
                `;
                adminFormsList.appendChild(formElement);
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {

    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }


    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
            
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        });
    });


    const distanceInput = document.getElementById('distance');
    const angleInput = document.getElementById('angle');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultHeightSpan = document.getElementById('result-height');

    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            const distance = parseFloat(distanceInput.value);
            const angle = parseFloat(angleInput.value);

            if (isNaN(distance) || isNaN(angle) || distance <= 0) {
                resultHeightSpan.textContent = 'Error: Introduce valores válidos.';
                resultHeightSpan.classList.add('text-red-500');
                return;
            }


            const angleInRadians = (angle * Math.PI) / 180;
            const height = distance * Math.tan(angleInRadians);
            
            resultHeightSpan.textContent = height.toFixed(2);
            resultHeightSpan.classList.remove('text-red-500');
        });
    }


    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }


    const calculateBudgetBtn = document.getElementById('calculate-budget-btn');

    if (calculateBudgetBtn) {
        calculateBudgetBtn.addEventListener('click', () => {
            const projectType = document.getElementById('project-type').value;
            const area = parseFloat(document.getElementById('area').value);
            const quality = document.getElementById('quality').value;

            if (isNaN(area) || area <= 0) {
                budgetResultSpan.textContent = 'Error: Introduce un área válida.';
                budgetResultSpan.classList.add('text-red-500');
                return;
            }


            const prices = {
                nueva_casa: { basico: 1000, medio: 1500, premium: 2000 },
                remodelacion: { basico: 700, medio: 1200, premium: 1800 },
                obra_civil: { basico: 1200, medio: 1800, premium: 2500 }
            };

            const basePrice = prices[projectType][quality];
            const totalCost = area * basePrice;

            budgetResultSpan.textContent = `$${totalCost.toLocaleString('es-CO')}`;
            budgetResultSpan.classList.remove('text-red-500');
        });
    }


    if (saveQuoteBtn) {
        saveQuoteBtn.addEventListener('click', async () => {
            const projectType = document.getElementById('project-type').value;
            const area = parseFloat(document.getElementById('area').value);
            const quality = document.getElementById('quality').value;
            const cost = budgetResultSpan.textContent;

            if (!isAuthReady || !userId || auth.currentUser.isAnonymous) {
                alert('Debes iniciar sesión con tu email para guardar una cotización.');
                return;
            }

            if (cost === '$0' || isNaN(area) || area <= 0) {
                alert('Por favor, calcula primero un presupuesto válido.');
                return;
            }
            
            saveQuoteBtn.disabled = true;
            saveQuoteBtn.textContent = 'Guardando...';

            try {
                const quotesCollection = collection(db, `artifacts/${appId}/users/${userId}/quotes`);
                await addDoc(quotesCollection, {
                    projectType: projectType,
                    area: area,
                    quality: quality,
                    cost: cost,
                    timestamp: serverTimestamp()
                });
                alert('¡Cotización guardada con éxito!');
            } catch (error) {
                console.error("Error al guardar la cotización:", error);
                alert('Error al guardar la cotización. Intenta de nuevo.');
            } finally {
                saveQuoteBtn.disabled = false;
                saveQuoteBtn.textContent = 'Guardar Cotización';
            }
        });
    }


    const beforeAfterContainer = document.querySelector('.before-after-container');
    const afterImg = document.querySelector('.after-img');
    const divider = document.querySelector('.slider-divider');
    if (beforeAfterContainer) {
        let isDragging = false;

        beforeAfterContainer.addEventListener('mousedown', (e) => {
            isDragging = true;
            beforeAfterContainer.classList.add('cursor-grabbing');
        });
        beforeAfterContainer.addEventListener('touchstart', (e) => {
            isDragging = true;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            beforeAfterContainer.classList.remove('cursor-grabbing');
        });
        document.addEventListener('touchend', () => {
            isDragging = false;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const rect = beforeAfterContainer.getBoundingClientRect();
            let x = e.clientX - rect.left;
            x = Math.max(0, Math.min(x, rect.width));
            afterImg.style.width = x + 'px';
            divider.style.left = x + 'px';
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const rect = beforeAfterContainer.getBoundingClientRect();
            let x = e.touches[0].clientX - rect.left;
            x = Math.max(0, Math.min(x, rect.width));
            afterImg.style.width = x + 'px';
            divider.style.left = x + 'px';
        });
    }


    const chatbotBtn = document.getElementById('chatbot-btn');
    const chatbotContainer = document.getElementById('chatbot-container');
    const closeChatbotBtn = document.getElementById('close-chatbot-btn');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatbotMessages = document.getElementById('chatbot-messages');
    
    if(chatbotBtn){
        chatbotBtn.addEventListener('click', () => {
            chatbotContainer.classList.toggle('show');
        });
    }
    if(closeChatbotBtn){
        closeChatbotBtn.addEventListener('click', () => {
            chatbotContainer.classList.remove('show');
        });
    }
    if(sendBtn){
        sendBtn.addEventListener('click', sendMessage);
    }
    if(userInput){
        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;


        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'flex items-end justify-end';
        userMessageDiv.innerHTML = `<div class="bg-blue-600 text-white p-3 rounded-lg max-w-[70%]">${message}</div>`;
        chatbotMessages.appendChild(userMessageDiv);
        

        setTimeout(() => {
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'flex items-start';
            let botResponse = 'Lo siento, no entiendo tu pregunta. ¿Puedes reformularla?';
            
            if (message.toLowerCase().includes('hola')) {
                botResponse = '¡Hola! ¿En qué puedo ayudarte hoy?';
            } else if (message.toLowerCase().includes('servicios')) {
                botResponse = 'Ofrecemos construcción de casas, remodelaciones, obra civil, planos y dirección de obra.';
            } else if (message.toLowerCase().includes('contacto')) {
                botResponse = 'Puedes contactarnos a través del formulario de contacto en la página o en nuestro teléfono: XXX-XXX-XXXX.';
            } else if (message.toLowerCase().includes('presupuesto')) {
                botResponse = 'Para un presupuesto, puedes usar nuestra calculadora en la sección "Calculadoras" o contactarnos directamente.';
            } else if (message.toLowerCase().includes('ubicacion')) {
                botResponse = 'Nuestra oficina principal se encuentra en [Dirección] y servimos a [Ciudad/Región].';
            }

            botMessageDiv.innerHTML = `<div class="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-[70%]">${botResponse}</div>`;
            chatbotMessages.appendChild(botMessageDiv);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight; // Auto-scroll
        }, 500);

        userInput.value = '';
    }


    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!isAuthReady || !userId) {
                formMessage.textContent = "Error: La autenticación no está lista. Intenta de nuevo en unos segundos.";
                formMessage.className = "mt-4 text-center font-semibold text-red-500";
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
            formMessage.textContent = '';
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const message = document.getElementById('message').value;

            try {

                const userContactFormCollection = collection(db, `artifacts/${appId}/users/${userId}/contact_form_submissions`);
                await addDoc(userContactFormCollection, {
                    name: name,
                    email: email,
                    phone: phone,
                    message: message,
                    timestamp: serverTimestamp()
                });

                formMessage.textContent = '¡Mensaje enviado con éxito!';
                formMessage.className = "mt-4 text-center font-semibold text-green-500";
                contactForm.reset();
            } catch (error) {
                console.error("Error al guardar el documento:", error);
                formMessage.textContent = 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.';
                formMessage.className = "mt-4 text-center font-semibold text-red-500";
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Mensaje';
            }
        });
    }

    const switchForm = (showLogin) => {
        if (loginTab) {
            if (showLogin) {
                loginTab.classList.add('active');
                signupTab.classList.remove('active');
                loginForm.classList.remove('hidden');
                signupForm.classList.add('hidden');
            } else {
                signupTab.classList.add('active');
                loginTab.classList.remove('active');
                signupForm.classList.remove('hidden');
                loginForm.classList.add('hidden');
            }
        }
    };

    if (loginTab) loginTab.addEventListener('click', () => switchForm(true));
    if (signupTab) signupTab.addEventListener('click', () => switchForm(false));


    if (loginForm) loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            loginMessage.textContent = 'Iniciando sesión...';
            await signInWithEmailAndPassword(auth, email, password);
            loginMessage.textContent = '¡Inicio de sesión exitoso!';
            loginMessage.className = 'mt-4 text-center font-semibold text-green-500';

            if (email === ADMIN_EMAIL && window.location.pathname.endsWith('index.html')) {
                window.location.href = 'admin.html';
            }
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            let errorMessage = 'Error al iniciar sesión. Por favor, verifica tus datos.';
            if (error.code === 'auth/invalid-email' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = 'Email o contraseña incorrectos.';
            }
            loginMessage.textContent = errorMessage;
            loginMessage.className = 'mt-4 text-center font-semibold text-red-500';
        }
    });


    if (signupForm) signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        try {
            signupMessage.textContent = 'Registrando usuario...';
            await createUserWithEmailAndPassword(auth, email, password);
            signupMessage.textContent = '¡Registro exitoso! Ya puedes iniciar sesión.';
            signupMessage.className = 'mt-4 text-center font-semibold text-green-500';
        } catch (error) {
            console.error("Error al registrarse:", error);
            let errorMessage = 'Error al registrar el usuario.';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Este email ya está en uso.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'El formato del email es inválido.';
            }
            signupMessage.textContent = errorMessage;
            signupMessage.className = 'mt-4 text-center font-semibold text-red-500';
        }
    });


    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
            } catch (error) {
                console.error("Error al cerrar sesión:", error);
            }
        });
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                window.location.href = 'index.html';
            } catch (error) {
                console.error("Error al cerrar sesión del admin:", error);
            }
        });
    }
});

