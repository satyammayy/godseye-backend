document.addEventListener('DOMContentLoaded', function() {
    // Grab tabs and both forms
    const tabs = document.querySelectorAll('.tab');
    const forms = {
      login: document.getElementById('loginForm'),
      register: document.getElementById('registerForm')
    };
  
    // Switch UI between “login” and “register”
    function switchTab(name) {
      tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
      forms.login.style.display    = name === 'login' ? 'block' : 'none';
      forms.register.style.display = name === 'register' ? 'block' : 'none';
      resetForm(forms[name]);
    }
    tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
  
    // Attach unified submit handler
    forms.login.addEventListener('submit',    handleSubmit('login'));
    forms.register.addEventListener('submit', handleSubmit('register'));
  
    // Reset form to initial state (hide OTP, clear messages)
    function resetForm(form) {
      form.reset();
      const otpGrp = form.querySelector('.otp-group');
      if (otpGrp) otpGrp.style.display = 'none';
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.textContent = 'Get OTP';
      form.querySelectorAll('.error, .success').forEach(el => el.remove());
    }
  
    // Show an error/success message under the form
    function showMessage(form, text, type = 'error') {
      form.querySelectorAll('.error, .success').forEach(el => el.remove());
      const div = document.createElement('div');
      div.className = type;
      div.textContent = text;
      form.appendChild(div);
    }
  
    // Build a handler factory for login vs register
    function handleSubmit(type) {
      return async function(e) {
        e.preventDefault();
        const form = forms[type];
        const email = form.querySelector(`#${type === 'login' ? 'loginEmail' : 'regEmail'}`).value.trim();
        const otpInput = form.querySelector(`#${type === 'login' ? 'loginOtp' : 'regOtp'}`);
        const otpVal = otpInput ? otpInput.value.trim() : '';
        const otpGrp = form.querySelector('.otp-group');
        const btn    = form.querySelector('button[type="submit"]');
  
        try {
          // STEP 1: request OTP
          if (!otpVal) {
            const res = await fetch('/auth/request-otp', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ email, type })
            });
            const result = await res.json();
            if (res.ok) {
              if (otpGrp) otpGrp.style.display = 'block';
              btn.textContent = type === 'login' ? 'Login' : 'Register';
              showMessage(form, 'OTP sent to your email', 'success');
            } else {
              showMessage(form, result.message || 'Could not send OTP');
            }
  
          // STEP 2: submit OTP (+ extra fields for register)
          } else {
            // build payload
            const payload = { email, otp: otpVal };
            if (type === 'register') {
              const name = form.querySelector('#regName').value.trim();
              const gender = form.querySelector('#regGender').value.trim();
              const college = form.querySelector('#regCollege').value.trim();
              Object.assign(payload, { name, gender, college
              });
            }
  
            const url = type === 'login' ? '/auth/login' : '/auth/register';
            const res = await fetch(url, {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(payload)
            });
            const result = await res.json();
  
            if (res.ok) {
              if (type === 'login') {
                // Store token and set default Authorization header
                const token = result.token;
                localStorage.setItem('token', token);
                // Set default Authorization header for future requests
                const defaultHeaders = new Headers();
                defaultHeaders.append('Authorization', `Bearer ${token}`);
                // Format user object with _id field
                const userData = {
                  _id: result.user.id,
                  name: result.user.name,
                  email: result.user.email,
                  gender: result.user.gender,
                  college: result.user.college,
                  imageUrl: result.user.imageUrl
                };
                localStorage.setItem('user', JSON.stringify(userData));
                showMessage(form, 'Login successful! Redirecting...', 'success');
                setTimeout(() => window.location.href = '/dashboard.html', 1500);
              } else {
                showMessage(form, 'Registration successful! Please log in.', 'success');
                setTimeout(() => switchTab('login'), 1500);
              }
            } else {
              showMessage(form, result.message || 'Operation failed');
            }
          }
        } catch (err) {
          console.error(err);
          showMessage(form, 'An error occurred. Please try again.');
        }
      };
    }
  
    // start on the login tab by default
    switchTab('login');
  });
  