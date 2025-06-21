        // Define the offset used for obfuscation.
        const OFFSET = 3; // The offset used to shift character codes

        /**
         * Decrypts an email address that was obfuscated using character codes
         * and a specific offset.
         * @param {string} obfuscatedEmail The string of obfuscated character codes (e.g., "112-101-103-...").
         * @returns {string} The original, decrypted email address.
         */
        function revealEmail(obfuscatedEmail) {
            // Split the string by the delimiter (hyphen) to get individual code strings
            const codeStrings = obfuscatedEmail.split('-');
            let revealedEmail = '';

            // Iterate over each code string
            for (const codeStr of codeStrings) {
                // Parse the string to an integer
                const charCode = parseInt(codeStr, 10);
                // Subtract the offset to get the original character code
                const originalCharCode = charCode - OFFSET;
                // Convert the character code back to a character and append to the result
                revealedEmail += String.fromCharCode(originalCharCode);
            }
            return revealedEmail;
        }

        /**
         * This function is not used in the client-side rendering but is provided
         * for demonstration if you want to generate new obfuscated strings.
         * @param {string} email The original email address to obfuscate.
         * @returns {string} The obfuscated string (e.g., "112-101-103-...").
         */
        function obfuscateEmail(email) {
            let obfuscatedParts = [];
            for (let i = 0; i < email.length; i++) {
                const charCode = email.charCodeAt(i);
                obfuscatedParts.push(charCode + OFFSET);
            }
            return obfuscatedParts.join('-');
        }

        // Wait until the entire HTML document is loaded before running the script
        document.addEventListener('DOMContentLoaded', () => {
            const emailLinks = document.querySelectorAll('.email-obfuscated');
            emailLinks.forEach(link => {
                const obfuscated = link.getAttribute('data-email-obfuscated');

                if (obfuscated) {
                    const originalEmail = revealEmail(obfuscated);
                    const emailDisplaySpan = link.querySelector('.email-display');

                    link.href = `mailto:${originalEmail}`;

                    if (emailDisplaySpan) {
                        emailDisplaySpan.textContent = originalEmail;
                    }
                }
            });
        });