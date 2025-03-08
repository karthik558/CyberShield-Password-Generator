// Constants for character sets
const CHARS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_-+=[]{}|:;<>,.?/',
  ambiguous: 'Il1O0'
};

// Password strength thresholds
const STRENGTH_THRESHOLDS = {
  weak: 40,
  medium: 80,
  strong: 100
};

class PasswordGenerator {
  constructor() {
    this.initializeElements();
    this.attachEventListeners();
    this.setupTooltips();
    this.hidePreloader();
  }

  initializeElements() {
    this.elements = {
      password: document.getElementById('password'),
      generateBtn: document.getElementById('generateButton'),
      copyBtn: document.getElementById('copyButton'),
      lengthSlider: document.getElementById('passwordLength'),
      lengthText: document.getElementById('passwordLengthText'),
      strengthBar: document.getElementById('strengthBar'),
      strengthText: document.getElementById('strengthText'),
      checkboxes: {
        uppercase: document.getElementById('uppercaseCheckbox'),
        lowercase: document.getElementById('lowercaseCheckbox'),
        numbers: document.getElementById('numbersCheckbox'),
        symbols: document.getElementById('symbolsCheckbox'),
        ambiguous: document.getElementById('ambiguousCheckbox'),
        requireAll: document.getElementById('requireAllTypes'),
        avoidRepeating: document.getElementById('avoidRepeating')
      }
    };

    // Add new elements to HTML first
    const customTextInput = document.createElement('input');
    customTextInput.type = 'text';
    customTextInput.id = 'customText';
    customTextInput.placeholder = 'Enter custom text (optional)';
    customTextInput.classList.add('custom-text-input');

    // Insert it before the generate button
    const generateButton = document.querySelector('.btn');
    generateButton.parentNode.insertBefore(customTextInput, generateButton);
  }

  attachEventListeners() {
    this.elements.generateBtn.addEventListener('click', () => this.generatePassword());
    this.elements.copyBtn.addEventListener('click', () => this.copyToClipboard());
    this.elements.lengthSlider.addEventListener('input', (e) => this.updateLengthText(e));
    this.elements.password.addEventListener('input', () => this.updateStrengthIndicator());

    // Ensure at least one checkbox is checked
    Object.values(this.elements.checkboxes).forEach(checkbox => {
      if (checkbox) {
        checkbox.addEventListener('change', () => this.validateCheckboxes());
      }
    });

    // Generate initial password
    this.generatePassword();
  }

  setupTooltips() {
    // Initialize Bootstrap tooltips
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(tooltip => new bootstrap.Tooltip(tooltip));
  }

  async generatePassword() {
    try {
      const length = parseInt(this.elements.lengthSlider.value);
      let chars = this.getSelectedCharacterSet();
      const customText = document.getElementById('customText').value.trim();

      if (chars.length === 0) {
        this.showError('Please select at least one character type');
        return;
      }

      let password = '';
      const requireAll = this.elements.checkboxes.requireAll?.checked;
      const avoidRepeating = this.elements.checkboxes.avoidRepeating?.checked;

      if (customText) {
        // Convert custom text to password-like format
        password = this.customTextToPassword(customText);
        // Append additional random characters if needed
        if (password.length < length) {
          password += this.generateRandomChars(length - password.length, chars, avoidRepeating);
        }
      } else if (requireAll) {
        password = this.generateWithRequiredTypes();
      } else {
        // Use crypto.getRandomValues for better randomness
        const array = new Uint32Array(length);
        crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
          const randomIndex = array[i] % chars.length;
          const char = chars.charAt(randomIndex);

          if (avoidRepeating && password.includes(char)) {
            i--; // Try again
            continue;
          }

          password += char;
        }
      }

      this.elements.password.value = password;
      this.updateStrengthIndicator();
      this.elements.generateBtn.classList.add('btn-success');
      setTimeout(() => this.elements.generateBtn.classList.remove('btn-success'), 500);

    } catch (error) {
      console.error('Error generating password:', error);
      this.showError('Error generating password');
    }
  }

  generateWithRequiredTypes() {
    const length = parseInt(this.elements.lengthSlider.value);
    let password = '';

    // Add one character from each selected type
    if (this.elements.checkboxes.uppercase?.checked) {
      password += this.getRandomChar(CHARS.uppercase);
    }
    if (this.elements.checkboxes.lowercase?.checked) {
      password += this.getRandomChar(CHARS.lowercase);
    }
    if (this.elements.checkboxes.numbers?.checked) {
      password += this.getRandomChar(CHARS.numbers);
    }
    if (this.elements.checkboxes.symbols?.checked) {
      password += this.getRandomChar(CHARS.symbols);
    }

    // Fill the rest randomly
    const chars = this.getSelectedCharacterSet();
    while (password.length < length) {
      const char = this.getRandomChar(chars);
      if (!this.elements.checkboxes.avoidRepeating?.checked || !password.includes(char)) {
        password += char;
      }
    }

    // Shuffle the password
    return this.shuffleString(password);
  }

  getSelectedCharacterSet() {
    let chars = '';

    if (this.elements.checkboxes.uppercase?.checked) chars += CHARS.uppercase;
    if (this.elements.checkboxes.lowercase?.checked) chars += CHARS.lowercase;
    if (this.elements.checkboxes.numbers?.checked) chars += CHARS.numbers;
    if (this.elements.checkboxes.symbols?.checked) chars += CHARS.symbols;

    if (this.elements.checkboxes.ambiguous?.checked) {
      chars = chars.split('').filter(char => !CHARS.ambiguous.includes(char)).join('');
    }

    return chars;
  }

  async copyToClipboard() {
    try {
      await navigator.clipboard.writeText(this.elements.password.value);

      // Visual feedback
      this.elements.copyBtn.innerHTML = '<i class="bi bi-check-lg"></i>';
      this.elements.copyBtn.classList.add('btn-success', 'copy-success');

      setTimeout(() => {
        this.elements.copyBtn.innerHTML = '<i class="bi bi-clipboard"></i>';
        this.elements.copyBtn.classList.remove('btn-success', 'copy-success');
      }, 1500);

    } catch (err) {
      console.error('Failed to copy:', err);
      this.showError('Failed to copy password');
    }
  }

  updateStrengthIndicator() {
    const password = this.elements.password.value;
    const strength = this.calculatePasswordStrength(password);

    // Update progress bar
    this.elements.strengthBar.style.width = `${strength}%`;
    this.elements.strengthBar.classList.remove('weak', 'medium', 'strong');

    if (strength <= STRENGTH_THRESHOLDS.weak) {
      this.elements.strengthBar.classList.add('weak');
      this.elements.strengthText.textContent = 'Weak Password';
    } else if (strength <= STRENGTH_THRESHOLDS.medium) {
      this.elements.strengthBar.classList.add('medium');
      this.elements.strengthText.textContent = 'Medium Password';
    } else {
      this.elements.strengthBar.classList.add('strong');
      this.elements.strengthText.textContent = 'Strong Password';
    }
  }

  calculatePasswordStrength(password) {
    if (!password) return 0;

    let strength = 0;

    // Length contribution (up to 40 points)
    strength += Math.min(password.length * 2, 40);

    // Character type contribution
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;

    // Bonus for mixture (up to 15 points)
    const varieties = (/[A-Z]/.test(password) + /[a-z]/.test(password) +
      /[0-9]/.test(password) + /[^A-Za-z0-9]/.test(password));
    strength += varieties * 5;

    return Math.min(strength, 100);
  }

  updateLengthText(event) {
    this.elements.lengthText.textContent = event.target.value;
  }

  validateCheckboxes() {
    const anyChecked = Object.values(this.elements.checkboxes).some(
      checkbox => checkbox && checkbox.id !== 'requireAllTypes' &&
        checkbox.id !== 'avoidRepeating' && checkbox.checked
    );

    if (!anyChecked) {
      this.elements.checkboxes.lowercase.checked = true;
      this.showError('At least one character type must be selected');
    }
  }

  showError(message) {
    // Create and show a Bootstrap alert
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alert.role = 'alert';
    alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
    document.body.appendChild(alert);

    setTimeout(() => alert.remove(), 3000);
  }

  hidePreloader() {
    setTimeout(() => {
      const preloader = document.querySelector('.preloader');
      preloader.style.opacity = '0';
      setTimeout(() => preloader.style.display = 'none', 500);
    }, 600);
  }

  getRandomChar(chars) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return chars.charAt(array[0] % chars.length);
  }

  shuffleString(str) {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
      const array2 = new Uint32Array(1);
      crypto.getRandomValues(array2);
      const j = array2[0] % (i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
  }

  customTextToPassword(text) {
    const replacements = {
      'a': '@',
      'i': '!',
      'e': '3',
      'o': '0',
      's': '$',
      'l': '1',
      't': '+',
      'h': '#',
      'b': '8'
    };

    return text.split('').map(char => {
      const lowerChar = char.toLowerCase();
      // Randomly decide to convert to upper or lower case
      const randomCase = Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase();
      // Replace with special character or keep the random case
      return replacements[lowerChar] || randomCase;
    }).join('');
  }

  generateRandomChars(length, chars, avoidRepeating) {
    let password = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      const randomIndex = array[i] % chars.length;
      const char = chars.charAt(randomIndex);

      if (avoidRepeating && password.includes(char)) {
        i--; // Try again
        continue;
      }

      password += char;
    }

    return password;
  }
}

// Initialize the password generator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PasswordGenerator();
});