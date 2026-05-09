document.addEventListener('DOMContentLoaded', () => {
    const envelope = document.getElementById('envelope');
    const flowerContainer = document.getElementById('flower-container');

    /** WebP sprites (see scripts/optimize_images.py) — tiny vs multi‑MB PNGs */
    const flowerAssets = [
        'assets/webp/blue_flower_1.webp',
        'assets/webp/pink_flower_1.webp',
        'assets/webp/pink_flower_2.webp',
        'assets/webp/pink_flower_3.webp',
        'assets/webp/pink_flower_4.webp',
        'assets/webp/pink_flower_5.webp',
        'assets/webp/purple_flower_1.webp',
        'assets/webp/purple_flower_2.webp',
        'assets/webp/yellow_flower_1.webp',
        'assets/webp/yellow_flower_2.webp',
        'assets/webp/yellow_flower_3.webp',
    ];
    let isOpened = false;
    let finaleMode = false;

    const random = (min, max) => Math.random() * (max - min) + min;

    const buildFinaleSparkles = () => {
        const host = document.getElementById('finale-sparkles');
        if (!host || host.children.length) return;
        for (let i = 0; i < 24; i++) {
            const s = document.createElement('span');
            s.className = 'finale-spark';
            s.style.left = `${random(4, 96)}%`;
            s.style.top = `${random(4, 96)}%`;
            host.appendChild(s);
        }
    };

    buildFinaleSparkles();

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

        // 2. Generate and Animate Flowers (use visual viewport on mobile when available)
        const vv = window.visualViewport;
        const width = Math.max(280, vv?.width ?? window.innerWidth);
        const height = Math.max(400, vv?.height ?? window.innerHeight);
        const minSide = Math.min(width, height);
        const numFlowers = minSide < 420 ? 160 : 200;
        const centerX = width / 2;
        const centerY = height / 2;

        const flowerData = [];
        const scatterPositions = [];

        const flowerSize = minSide < 420 ? 64 : 80;
        const halfFlower = flowerSize / 2;
        const overlapRatio = 0.15;
        const minDistance = flowerSize * (1 - overlapRatio);

        const edgeMargin = Math.max(20, Math.round(minSide * 0.06));
        const maxHeartRadius = minSide / 2 - edgeMargin - halfFlower;
        const numHeartStages = 5;
        const heartParamMax = 17;
        const stepFromDensity = minDistance / 15;
        const stepFromViewport = maxHeartRadius / (heartParamMax * numHeartStages * 1.08);
        const heartScaleStep = Math.max(0.65, Math.min(stepFromDensity, stepFromViewport));

        const heartPoints = [];

        for (let s = 1; s <= numHeartStages; s++) {
            const stageScale = s * heartScaleStep;
            let lastX, lastY;
            let dist = 0;
            // Trace the heart perimeter
            for (let t = 0; t <= Math.PI * 2; t += 0.01) {
                // Standard heart curve parametric equation
                let hX = 16 * Math.pow(Math.sin(t), 3);
                let hY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
                
                let px = centerX + hX * stageScale - halfFlower;
                let py = centerY + hY * stageScale - halfFlower;
                // tiny randomness
                px += random(-3, 3);
                py += random(-3, 3);
                
                if (t === 0) {
                    heartPoints.push({ x: px, y: py, stage: s });
                    lastX = px; lastY = py;
                } else {
                    let dx = px - lastX;
                    let dy = py - lastY;
                    let stepDist = Math.sqrt(dx*dx + dy*dy);
                    dist += stepDist;
                    if (dist >= minDistance) {
                        heartPoints.push({ x: px, y: py, stage: s });
                        dist = 0;
                    }
                    lastX = px; lastY = py;
                }
            }
        }
        
        const numHeartFlowers = Math.min(heartPoints.length, numFlowers);
        
        // Generate Scatter points for ALL flowers (they will all eventually scatter)
        for (let i = 0; i < numFlowers; i++) {
            let foundSpot = false;
            let attempts = 0;
            let finalX, finalY;
            
            while (!foundSpot && attempts < 150) {
                const m = edgeMargin + halfFlower;
                const testX = random(m, width - m);
                const testY = random(m, height - m);
                
                let tooClose = false;
                for (let pos of scatterPositions) {
                    let dx = testX - pos.x;
                    let dy = testY - pos.y;
                    if (dx * dx + dy * dy < minDistance * minDistance) {
                        tooClose = true;
                        break;
                    }
                }
                
                if (!tooClose) {
                    finalX = testX - halfFlower;
                    finalY = testY - halfFlower;
                    scatterPositions.push({ x: testX, y: testY, finalX, finalY });
                    foundSpot = true;
                }
                attempts++;
            }
            
            if (!foundSpot) {
                finalX = random(halfFlower, width - halfFlower) - halfFlower;
                finalY = random(halfFlower, height - halfFlower) - halfFlower;
                scatterPositions.push({
                    x: finalX + halfFlower,
                    y: finalY + halfFlower,
                    finalX,
                    finalY,
                });
            }
        }

        let currentScatterStage = 6;
        let scatterFlowersCount = 0;
        let maxScatterStage = 6;

        for (let i = 0; i < numFlowers; i++) {
            const img = document.createElement('img');
            img.src = flowerAssets[Math.floor(Math.random() * flowerAssets.length)];
            img.className = 'flower-particle';
            img.width = flowerSize;
            img.height = flowerSize;
            img.style.width = `${flowerSize}px`;
            img.style.height = `${flowerSize}px`;
            img.decoding = 'async';
            img.loading = 'lazy';
            flowerContainer.appendChild(img);
            
            let isHeart = i < numHeartFlowers;
            let heartPos = isHeart ? heartPoints[i] : null;
            let scatterPos = scatterPositions[i];
            
            let scatterStage;
            if (isHeart) {
                scatterStage = 6 + Math.floor(random(0, 3));
            } else {
                scatterStage = currentScatterStage;
                scatterFlowersCount++;
                if (scatterFlowersCount >= 60) {
                    currentScatterStage++;
                    scatterFlowersCount = 0;
                }
            }
            maxScatterStage = Math.max(maxScatterStage, scatterStage);

            flowerData.push({
                element: img,
                isHeart: isHeart,
                heartPos: heartPos,
                scatterFinalX: scatterPos.finalX,
                scatterFinalY: scatterPos.finalY,
                scatterStage: scatterStage
            });
        }

        // Delay when the heart shatters and remaining flowers erupt
        const heartBreakDelay = 4.2; 

        // GSAP Wave Explosion & Shatter Animation
        flowerData.forEach((data) => {
            if (data.isHeart) {
                // Phase 1: Form the Heart
                gsap.fromTo(data.element,
                    {
                        x: centerX - halfFlower,
                        y: centerY - halfFlower,
                        scale: 0,
                        opacity: 0,
                        rotation: random(-180, 180)
                    },
                    {
                        x: data.heartPos.x,
                        y: data.heartPos.y,
                        scale: random(0.8, 1.3),
                        opacity: 1,
                        rotation: random(180, 360),
                        duration: 1.5,
                        ease: "power3.out",
                        delay: data.heartPos.stage * 0.5,
                        onComplete: function () {
                            // Infinite Floating & Rotation in place while in heart shape
                            gsap.to(data.element, {
                                rotation: "+=" + (Math.random() > 0.5 ? 360 : -360),
                                duration: random(15, 30),
                                repeat: -1,
                                ease: "linear"
                            });
                            gsap.to(data.element, {
                                y: "+=" + random(5, 10),
                                x: "+=" + random(-3, 3),
                                duration: random(2, 4),
                                yoyo: true,
                                repeat: -1,
                                ease: "sine.inOut"
                            });
                        }
                    }
                );
                
                // Phase 2: Heart Shatters and Scatters
                gsap.to(data.element, {
                    x: data.scatterFinalX,
                    y: data.scatterFinalY,
                    scale: random(0.8, 1.8),
                    rotation: "+=" + random(180, 360),
                    duration: 1.8,
                    ease: "power3.out",
                    delay: heartBreakDelay + (data.scatterStage - 6) * 0.2, // Staggered shattering
                    overwrite: "auto", // Automatically kills overlapping tweens (like x/y bobbing)
                    onComplete: function() {
                        // Restart final floating
                        gsap.to(data.element, {
                            rotation: "+=" + (Math.random() > 0.5 ? 360 : -360),
                            duration: random(15, 30),
                            repeat: -1,
                            ease: "linear"
                        });
                        gsap.to(data.element, {
                            y: "+=" + random(10, 20),
                            x: "+=" + random(-5, 5),
                            duration: random(2, 4),
                            yoyo: true,
                            repeat: -1,
                            ease: "sine.inOut"
                        });
                    }
                });

            } else {
                // Non-heart flowers: Wait in center, then erupt during Phase 2
                gsap.fromTo(data.element,
                    {
                        x: centerX - halfFlower,
                        y: centerY - halfFlower,
                        scale: 0,
                        opacity: 0,
                        rotation: random(-180, 180)
                    },
                    {
                        x: data.scatterFinalX,
                        y: data.scatterFinalY,
                        scale: random(0.8, 1.8),
                        opacity: 1,
                        rotation: random(180, 360),
                        duration: 1.5,
                        ease: "power3.out",
                        delay: heartBreakDelay + (data.scatterStage - 6) * 0.2,
                        onComplete: function () {
                            // Infinite Floating
                            gsap.to(data.element, {
                                rotation: "+=" + (Math.random() > 0.5 ? 360 : -360),
                                duration: random(15, 30),
                                repeat: -1,
                                ease: "linear"
                            });
                            gsap.to(data.element, {
                                y: "+=" + random(10, 20),
                                x: "+=" + random(-5, 5),
                                duration: random(2, 4),
                                yoyo: true,
                                repeat: -1,
                                ease: "sine.inOut"
                            });
                        }
                    }
                );
            }
        });

        const scatterTailSec = (maxScatterStage - 5) * 0.2;
        const pauseAfterMotionSec = minSide < 480 ? 2.6 : 2.0;
        const delayForFinale =
            heartBreakDelay + scatterTailSec + 1.35 + pauseAfterMotionSec;

        const finaleRoot = document.getElementById('finale-root');

        gsap.delayedCall(delayForFinale, () => {
            gsap.killTweensOf('.flower-particle');
            document.querySelectorAll('#flower-container .flower-particle').forEach((el) => {
                gsap.killTweensOf(el);
            });

            const tl = gsap.timeline({
                defaults: { ease: 'power2.inOut' },
                onComplete: () => {
                    finaleMode = true;
                    flowerContainer.style.visibility = 'hidden';
                },
            });

            tl.to(flowerContainer, { opacity: 0, duration: 0.9 }).to(
                '#finale-overlay',
                { opacity: 1, duration: 0.75, ease: 'power1.out' },
                '<0.18',
            )
                .add(() => {
                    finaleRoot.classList.add('is-on');
                    finaleRoot.setAttribute('aria-hidden', 'false');
                })
                .fromTo(
                    '#finale-scene',
                    { opacity: 0, y: 32, scale: 0.96 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.95, ease: 'power3.out' },
                    '-=0.38',
                );

            tl.to(
                '.finale-spark',
                {
                    opacity: 0.95,
                    scale: 1,
                    duration: 0.55,
                    stagger: { amount: 0.45, from: 'random' },
                    ease: 'sine.out',
                },
                '-=0.55',
            );

            tl.to(
                '.finale-spark',
                {
                    opacity: 0.35,
                    scale: 0.65,
                    duration: 1.4,
                    yoyo: true,
                    repeat: -1,
                    stagger: { amount: 0.9, from: 'random' },
                    ease: 'sine.inOut',
                },
                '-=0.2',
            );
        });
    };

    envelope.addEventListener('click', openEnvelope);

    // 5. Parallax Effect on Mouse Move
    window.addEventListener('mousemove', (e) => {
        if (!isOpened || finaleMode) return;

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
        if (!isOpened || finaleMode || !e.touches[0]) return;

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
