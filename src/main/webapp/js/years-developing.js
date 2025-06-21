    // --- Years of Experience Logic ---
    const startDate = new Date(2018, 22, 10); // Example: October 22, 2018, my first day at work at Accenture Federal Services
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - startDate);

    // Convert milliseconds to years
    // (1 year = 365.25 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
    const years = diffTime / (1000 * 60 * 60 * 24 * 365.25);

    const yearsDevelopingSpan = document.getElementById('years-developing');
    if (yearsDevelopingSpan) {
        yearsDevelopingSpan.textContent = years.toFixed(0);
    }