document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");

    // Variables
    const isDarkMode = localStorage.getItem('theme') === 'dark';
    const colors = { light: "#4a90e2", dark: "#f1c40f" };
    const cards = document.querySelectorAll('.project-card');
    console.log("Number of project cards found:", cards.length);

    // Initialize particles
    initParticles(isDarkMode ? colors.dark : colors.light);

    // DOM elements
    const els = {
        themeToggle: document.getElementById('theme-toggle'),
        body: document.body,
        sunIcon: document.getElementById('sun-icon'),
        moonIcon: document.getElementById('moon-icon'),
        chatContainer: document.getElementById('chat-container'),
        minimizeChat: document.getElementById('minimize-chat'),
        chatIcon: document.getElementById('chat-icon'),
        chatMessages: document.getElementById('chat-messages'),
        chatInput: document.getElementById('chat-input'),
        sendButton: document.getElementById('send-button'),
        projectsTitle: document.getElementById('projects-title'),
        projectContainer: document.querySelector('.project-container'),
        sectionA: document.getElementById('section-a'),
        prevButton: document.querySelector('.pagination-button.prev'),
        nextButton: document.querySelector('.pagination-button.next')
    };

    // Pagination variables
    const cardsPerPage = 3;
    let currentPage = 1;

    // Theme functionality
    function toggleTheme() {
        console.log("Toggling theme");
        const isDark = els.body.classList.toggle('dark-mode');
        els.sunIcon.style.display = isDark ? 'none' : 'inline';
        els.moonIcon.style.display = isDark ? 'inline' : 'none';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateParticlesColor(colors[isDark ? 'dark' : 'light']);
    }

    // Chat functionality
    function isMobile() { return window.innerWidth <= 768; }

    function toggleChat() {
        console.log("Toggling chat");
        const isMinimized = els.chatContainer.classList.toggle('chat-minimized');
        els.body.classList.toggle('chat-open', !isMinimized && isMobile());
        els.chatIcon.style.display = isMinimized ? 'flex' : 'none';

        if (isMinimized) {
            els.chatContainer.addEventListener('transitionend', function hide() {
                els.chatContainer.style.display = 'none';
                els.chatContainer.removeEventListener('transitionend', hide);
            });
        } else {
            els.chatContainer.style.display = 'flex';
            if (!els.chatMessages.hasChildNodes()) addWelcomeMessage();
        }
    }

    function setInitialChatState() {
        console.log("Setting initial chat state");
        els.chatContainer.classList.add('chat-minimized');
        els.chatContainer.style.display = 'none';
        els.chatIcon.style.display = 'flex';
    }

    function addMessage(message, isUser = false) {
        console.log("Adding message:", message, "isUser:", isUser);
        const messageEl = document.createElement('div');
        messageEl.classList.add(isUser ? 'user-message' : 'bot-message');
        
        if (!isUser) {
            const avatarEl = document.createElement('div');
            avatarEl.classList.add('bot-avatar');
            avatarEl.textContent = 'B';
            messageEl.appendChild(avatarEl);
    
            const contentEl = document.createElement('div');
            contentEl.classList.add('bot-message-content');
            contentEl.textContent = message;
            messageEl.appendChild(contentEl);
        } else {
            messageEl.textContent = message;
        }
    
        els.chatMessages.appendChild(messageEl);
        els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
    }

    function addWelcomeMessage() {
        addMessage("Hi there, I'm Bill, nice to meet you.\nI'm a Taiwanese American born in 2004, currently a college student and is looking to become a data analyst. If you have anything you want to know about me, ask away!", false);
    }

    function handleSendMessage() {
        const message = els.chatInput.value.trim();
        if (message) {
            addMessage(message, true);
            els.chatInput.value = '';
            
            // Send request to backend
            fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message }),
            })
            .then(response => response.json())
            .then(data => {
                addMessage(data.response, false);
            })
            .catch((error) => {
                console.error('Error:', error);
                addMessage('Sorry, there was an error processing your request.', false);
            });
        }
    }

    // Project card functionality
    function initializeProjectCards() {
        console.log("Initializing project cards");
        cards.forEach((card, index) => {
            console.log(`Initializing card ${index + 1}`);
            const cornerFolds = card.querySelectorAll('.corner-fold');
            let flipTimer;
    
            function flipCard(e) {
                console.log(`Flipping card ${index + 1}`);
                e.preventDefault();
                e.stopPropagation();
                card.classList.toggle('flipped');
                if (card.classList.contains('flipped')) {
                    startFlipTimer();
                } else {
                    clearTimeout(flipTimer);
                }
            }
    
            function startFlipTimer() {
                clearTimeout(flipTimer);
                flipTimer = setTimeout(() => {
                    if (card.classList.contains('flipped')) {
                        card.classList.remove('flipped');
                    }
                }, 20000);
            }
    
            cornerFolds.forEach(fold => {
                fold.addEventListener('click', flipCard, true);
            });
    
            // Initialize carousel for this card
            initializeCarousel(card, index);
        });
    }

    function initializeCarousel(card, cardIndex) {
        console.log(`Initializing carousel for card ${cardIndex + 1}`);
        const images = card.querySelectorAll('.carousel-image');
        const dots = card.querySelectorAll('.dot');
        let currentIndex = 0;
        let interval;

        function showImage(index) {
            console.log(`Showing image ${index + 1} for card ${cardIndex + 1}`);
            images.forEach(img => img.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            images[index].classList.add('active');
            dots[index].classList.add('active');
        }

        function nextImage() {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        }

        function startInterval() {
            clearInterval(interval);
            interval = setInterval(nextImage, 5000);
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log(`Dot ${index + 1} clicked for card ${cardIndex + 1}`);
                currentIndex = index;
                showImage(currentIndex);
                startInterval();
            });
        });

        showImage(currentIndex);
        startInterval();

        card.addEventListener('transitionend', () => {
            if (card.classList.contains('flipped')) {
                clearInterval(interval);
            } else {
                startInterval();
            }
        });
    }

    // Pagination functionality
    function showPage(page) {
        console.log(`Showing page ${page}`);
        const startIndex = (page - 1) * cardsPerPage;
        const endIndex = startIndex + cardsPerPage;

        cards.forEach((card, index) => {
            const isVisible = index >= startIndex && index < endIndex;
            card.style.display = isVisible ? 'block' : 'none';
            if (isVisible) {
                initializeCarousel(card, index);
            }
        });

        els.prevButton.disabled = (page === 1);
        els.nextButton.disabled = (endIndex >= cards.length);

        // Scroll to the top of the page
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    function prevPage() {
        if (currentPage > 1) {
            currentPage--;
            showPage(currentPage);
        }
    }

    function nextPage() {
        if (currentPage < Math.ceil(cards.length / cardsPerPage)) {
            currentPage++;
            showPage(currentPage);
        }
    }

    // Layout adjustment function
    function adjustLayout() {
        const isDesktop = window.innerWidth > 1200;

        if (!isDesktop) {
            els.projectsTitle.style.position = 'relative';
            els.projectsTitle.style.top = 'auto';
            els.projectsTitle.style.left = '0';
            els.projectsTitle.style.transform = 'none';
            els.projectsTitle.style.width = '100%';
            els.projectsTitle.style.marginTop = '30px';
            els.projectsTitle.style.marginBottom = '20px';
            els.projectsTitle.style.paddingLeft = '20px';

            els.projectContainer.style.width = els.sectionA.offsetWidth + 'px';
            els.projectContainer.style.justifyContent = 'center';
            els.projectContainer.style.margin = '0 auto';
        } else {
            els.projectsTitle.style = '';
            els.projectContainer.style = '';
        }
    }

    // Event listeners
    els.themeToggle.addEventListener('click', toggleTheme);
    els.minimizeChat.addEventListener('click', toggleChat);
    els.chatIcon.addEventListener('click', toggleChat);
    els.sendButton.addEventListener('click', handleSendMessage);
    els.chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleSendMessage(); });
    window.addEventListener('resize', () => {
        setInitialChatState();
        adjustLayout();
    });
    els.prevButton.addEventListener('click', prevPage);
    els.nextButton.addEventListener('click', nextPage);

    // Initialize
    if (isDarkMode) toggleTheme();
    setInitialChatState();
    adjustLayout();
    showPage(currentPage);
    initializeProjectCards();
});

function initParticles(color) {
    console.log("Initializing particles with color:", color);
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: color },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: false },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: color, opacity: 0.4, width: 1 },
            move: { enable: true, speed: 2, direction: "none", random: false, straight: false, out_mode: "out", bounce: false }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "grab" },
                onclick: { enable: true, mode: "push" },
                resize: true
            },
            modes: {
                grab: { distance: 140, line_linked: { opacity: 1 } },
                push: { particles_nb: 4 }
            }
        },
        retina_detect: true
    });
}

function updateParticlesColor(color) {
    console.log("Updating particles color to:", color);
    if (pJSDom && pJSDom[0] && pJSDom[0].pJS) {
        pJSDom[0].pJS.particles.color.value = color;
        pJSDom[0].pJS.particles.line_linked.color = color;
        pJSDom[0].pJS.particles.array.forEach(particle => {
            particle.color.value = color;
        });
        pJSDom[0].pJS.fn.particlesRefresh();
    } else {
        console.warn("Particles.js not initialized or unavailable");
    }
}