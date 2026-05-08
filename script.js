document.addEventListener('DOMContentLoaded', () => {
    const envelope = document.querySelector('.envelope-container');
    const tapText = document.querySelector('.tap-text');

    const openEnvelope = () => {
        // Simple animation to simulate opening or transitioning
        envelope.style.transform = 'scale(1.1) translateY(-10px)';
        envelope.style.opacity = '0';
        envelope.style.transition = 'all 0.6s ease';
        
        tapText.style.opacity = '0';
        tapText.style.transition = 'all 0.4s ease';

        // After the animation, you could redirect or show a modal
        setTimeout(() => {
            // For now, we just reset it after a delay
            alert('Envelope opened! (You can link this to the next page)');
            
            // Reset for demo purposes
            envelope.style.transform = '';
            envelope.style.opacity = '1';
            tapText.style.opacity = '1';
        }, 800);
    };

    envelope.addEventListener('click', openEnvelope);
    tapText.addEventListener('click', openEnvelope);
});
