/**
 * Valentine's Experience - Cinematic Noir
 */

class CinematicExperience {
    constructor() {
        this.currentScreen = 0;
        this.screens = document.querySelectorAll('.screen');
        this.totalScreens = this.screens.length;
        this.isTransitioning = false;
        this.audio = document.getElementById('bg-music');

        this.init();
        this.initCanvas();
        this.initCursor();
    }

    init() {
        this.bindEvents();

        // Initial state for screen 0
        setTimeout(() => {
            this.animateScreen(0);
        }, 500);
    }

    bindEvents() {
        // Enter button - Acts as the "Start Experience" trigger
        document.getElementById('enter-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.startExperience();
        });

        // Restart button
        document.getElementById('restart-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.restart();
        });

        // Audio Visualizer Toggle
        document.getElementById('audio-control')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleAudio();
        });

        // Screen click to advance (except first)
        this.screens.forEach((screen, index) => {
            screen.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') return;
                if (e.target.closest('.audio-visualizer')) return;

                // Block advance on first screen (must use button)
                if (index === 0) return;

                // Allow advance on last screen to restart? No, use button.
                if (index === this.totalScreens - 1) return;

                this.nextScreen();
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                if (this.currentScreen > 0 && this.currentScreen < this.totalScreens - 1) {
                    this.nextScreen();
                }
            }
        });
    }

    startExperience() {
        // Try to play audio
        this.audio.play().then(() => {
            document.getElementById('audio-control').classList.remove('paused');
        }).catch(e => {
            console.log("Audio autoplay prevented", e);
            document.getElementById('audio-control').classList.add('paused');
        });

        this.nextScreen();
    }

    toggleAudio() {
        if (this.audio.paused) {
            this.audio.play();
            document.getElementById('audio-control').classList.remove('paused');
        } else {
            this.audio.pause();
            document.getElementById('audio-control').classList.add('paused');
        }
    }

    initCanvas() {
        const canvas = document.getElementById('bg-canvas');
        const ctx = canvas.getContext('2d');

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const particles = [];
        const particleCount = window.innerWidth < 768 ? 30 : 60; // Less on mobile

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.2;
                this.vy = (Math.random() - 0.5) * 0.2;
                this.size = Math.random() * 2;
                this.alpha = Math.random() * 0.5;
                this.life = Math.random() * 100;
                this.color = `rgba(220, 38, 38, ${this.alpha})`;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.life--;

                if (this.life <= 0 || this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
                    this.reset();
                }
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }

        animate();
    }

    initCursor() {
        // Only on desktop
        if (window.matchMedia("(pointer: coarse)").matches) return;

        const dot = document.getElementById('cursor-dot');
        const circle = document.getElementById('cursor-circle');

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let circleX = mouseX;
        let circleY = mouseY;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Direct update for dot (instant)
            dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

            // Check for interactive elements
            if (['BUTTON', 'A', 'INPUT'].includes(e.target.tagName) || e.target.closest('button')) {
                document.body.classList.add('interacting');
            } else {
                document.body.classList.remove('interacting');
            }
        });

        // Smooth follow for circle
        const animateCursor = () => {
            const dx = mouseX - circleX;
            const dy = mouseY - circleY;

            circleX += dx * 0.15;
            circleY += dy * 0.15;

            circle.style.transform = `translate(${circleX}px, ${circleY}px) translate(-50%, -50%)`;

            requestAnimationFrame(animateCursor);
        };

        animateCursor();
    }

    nextScreen() {
        if (this.isTransitioning || this.currentScreen >= this.totalScreens - 1) return;

        this.isTransitioning = true;

        const currentScreenEl = this.screens[this.currentScreen];
        const nextIndex = this.currentScreen + 1;
        const nextScreenEl = this.screens[nextIndex];

        currentScreenEl.classList.remove('active');

        // Wait for fade out
        setTimeout(() => {
            this.currentScreen = nextIndex;
            nextScreenEl.classList.add('active');
            this.animateScreen(nextIndex);

            setTimeout(() => {
                this.isTransitioning = false;
            }, 1000);
        }, 800);
    }

    animateScreen(index) {
        const screen = this.screens[index];
        const elements = screen.querySelectorAll('.title-lg, .text-md, .manifesto-line, .huge-text, .final-sub, .tap-hint');

        elements.forEach(el => {
            el.classList.remove('visible');

            // Calculate delay
            let delay = 300;

            // Check for explicit delay classes (delay-1, delay-2, etc)
            const classes = Array.from(el.classList);
            const delayClass = classes.find(c => c.startsWith('delay-'));
            const isHint = classes.includes('tap-hint');

            if (delayClass) {
                const num = parseInt(delayClass.split('-')[1]);
                delay = 500 + (num * 1200); // 1.2s spacing for reading time
            } else if (isHint) {
                delay = 4000; // Show hint last
            } else if (index !== 0) {
                // Stagger default if no specific class (except first screen)
                delay += 300;
            }

            setTimeout(() => {
                el.classList.add('visible');
            }, delay);
        });
    }

    restart() {
        this.screens.forEach(s => s.classList.remove('active'));
        this.currentScreen = 0;
        this.screens[0].classList.add('active');

        // Reset audio if needed
        this.audio.currentTime = 0;
        this.audio.play();

        setTimeout(() => {
            this.animateScreen(0);
        }, 500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CinematicExperience();
});
