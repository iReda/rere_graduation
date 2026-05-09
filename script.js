document.addEventListener('DOMContentLoaded', () => {
    const envelope = document.getElementById('envelope');
    const flowerContainer = document.getElementById('flower-container');
    const letterCard = document.getElementById('letter-card');

    // Array of multiple flower assets
    const flowerAssets = [
        'assets/040fc6f9d008548320fa2fd7b8f9b6f0.png',
        'assets/37cb415660c2b476d5cdfad297dc27b3.png',
        'assets/429fad63ff677d55864f29a38ec43073.png',
        'assets/59d0d0eb0b757debb24f34c204e4a69e.png',
        'assets/5aa8e22e7603fc558cffbf27.png',
        'assets/5aa8e2377603fc558cffbf28.png',
        'assets/5aa8e24d7603fc558cffbf2a.png',
        'assets/5aa8e2557603fc558cffbf2b.png',
        'assets/5aa8e2757603fc558cffbf2e.png',
        'assets/5da23fecb6645f830efed7ddd0e697f6.png',
        'assets/78ef85f5962f0b8c08e1a8664cfca025.png',
        'assets/98a8c2e9fd32a762dffb3b2667ef15b9.png',
        'assets/e4c8e4c59fba1f021ac630833498c4de.png',
        'assets/f1af24c2e698afb0d4dcb6029dd5b60e.png'
    ];
    const numFlowers = 500;

    let isOpened = false;

    // Generate random number in range
    const random = (min, max) => Math.random() * (max - min) + min;

    const openEnvelope = () => {
        if (isOpened) return;
        isOpened = true;

        // 1. Animate Envelope Out
        gsap.to(envelope, {
            scale: 0,
            opacity: 0,
            duration: 0.6,
            ease: "back.in(1.5)",
            onComplete: () => envelope.style.display = 'none'
        });

        // 2. Generate and Animate Flowers
        const { innerWidth: width, innerHeight: height } = window;
        const centerX = width / 2;
        const centerY = height / 2;

        const flowerElements = [];

        for (let i = 0; i < numFlowers; i++) {
            const img = document.createElement('img');
            // Pick a random flower from the array
            img.src = flowerAssets[Math.floor(Math.random() * flowerAssets.length)];
            img.className = 'flower-particle';

            // Keep the drop-shadow but remove hue/saturate filters
            img.style.filter = `drop-shadow(0px 8px 12px rgba(0,0,0,0.15))`;

            flowerContainer.appendChild(img);
            flowerElements.push(img);
        }

        // GSAP Explosion Animation
        gsap.fromTo(flowerElements,
            {
                // Start from center
                x: centerX - 40, // 40 is half the image width
                y: centerY - 40,
                scale: 0,
                opacity: 0,
                rotation: () => random(-180, 180)
            },
            {
                // Explode outward to random viewport positions
                x: () => random(-50, width),
                y: () => random(-50, height),
                scale: () => random(0.8, 2.5),
                opacity: 1,
                rotation: () => random(-180, 180),
                duration: 1.8,
                ease: "back.out(1.4)",
                stagger: 0.03, // Rapid fire sequence
                onComplete: function () {
                    // 3. Infinite Floating Animation once they land
                    gsap.to(this.targets()[0], {
                        y: "+=" + random(10, 25),
                        x: "+=" + random(-10, 10),
                        rotation: "+=" + random(-5, 5),
                        duration: random(2, 4),
                        yoyo: true,
                        repeat: -1,
                        ease: "sine.inOut"
                    });
                }
            }
        );

        // 4. Reveal Letter Card
        // Calculate total time: stagger * numFlowers + explosion duration
        const delayForLetter = (0.03 * numFlowers) + 1.0;

        gsap.to(letterCard, {
            y: 0,
            opacity: 1,
            duration: 1.2,
            delay: delayForLetter,
            ease: "bounce.out",
            onStart: () => letterCard.classList.add('visible')
        });
    };

    envelope.addEventListener('click', openEnvelope);

    // 5. Parallax Effect on Mouse Move
    window.addEventListener('mousemove', (e) => {
        if (!isOpened) return;

        const { innerWidth: width, innerHeight: height } = window;
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Move the flower container slightly in the opposite direction
        const moveX = (mouseX - width / 2) * -0.05;
        const moveY = (mouseY - height / 2) * -0.05;

        gsap.to(flowerContainer, {
            x: moveX,
            y: moveY,
            duration: 0.8,
            ease: "power1.out"
        });
    });

    // Add touch support for parallax
    window.addEventListener('touchmove', (e) => {
        if (!isOpened || !e.touches[0]) return;

        const { innerWidth: width, innerHeight: height } = window;
        const mouseX = e.touches[0].clientX;
        const mouseY = e.touches[0].clientY;

        const moveX = (mouseX - width / 2) * -0.05;
        const moveY = (mouseY - height / 2) * -0.05;

        gsap.to(flowerContainer, {
            x: moveX,
            y: moveY,
            duration: 0.8,
            ease: "power1.out"
        });
    }, { passive: true });
});
