document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnArrow = document.getElementById('btnArrow');

    // ============================================
    // Toggle Show/Hide Password
    // ============================================
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        if (type === 'text') {
            // Ikon mata tertutup
            eyeIcon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            `;
        } else {
            // Ikon mata terbuka
            eyeIcon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            `;
        }
    });

    // ============================================
    // Form Submission dengan Loading State
    // ============================================
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value;

        // Validasi
        if (!email || !password) {
            shakeButton();
            return;
        }

        if (password.length < 6) {
            alert('Password minimal 6 karakter');
            passwordInput.focus();
            return;
        }

        // Loading State
        submitBtn.disabled = true;
        btnText.innerText = 'Signing in...';
        btnArrow.style.display = 'none';
        
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        submitBtn.appendChild(spinner);

        // Simulasi proses login (ganti dengan API call asli)
        setTimeout(() => {
            submitBtn.removeChild(spinner);
            btnText.innerText = 'Sign In';
            btnArrow.style.display = 'block';
            submitBtn.disabled = false;

            // Success feedback
            showSuccess();
            
            console.log('Login Data:', { email, password });
            // loginForm.reset(); // Uncomment jika ingin reset form
        }, 1800);
    });

    // ============================================
    // Efek Shake saat Error
    // ============================================
    function shakeButton() {
        submitBtn.animate(
            [
                { transform: 'translateX(0)' },
                { transform: 'translateX(-8px)' },
                { transform: 'translateX(8px)' },
                { transform: 'translateX(-4px)' },
                { transform: 'translateX(4px)' },
                { transform: 'translateX(0)' }
            ],
            { duration: 400, easing: 'ease-in-out' }
        );
    }

    // ============================================
    // Success Feedback (Custom Notification)
    // ============================================
    function showSuccess() {
        const notification = document.createElement('div');
        notification.className = 'fixed top-6 right-6 z-50 px-6 py-4 rounded-xl text-white font-medium';
        notification.style.cssText = `
            background: rgba(34, 197, 94, 0.15);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(34, 197, 94, 0.3);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        `;
        notification.innerHTML = `
            <div class="flex items-center gap-3">
                <svg class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Login successful!</span>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.4s ease forwards';
            setTimeout(() => notification.remove(), 400);
        }, 3000);
    }

    // Inject animation keyframes untuk notifikasi
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});
