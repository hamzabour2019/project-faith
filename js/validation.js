// Form validation utilities
document.addEventListener('DOMContentLoaded', function() {
    initializeValidation();
});

function initializeValidation() {
    // Add real-time validation to all forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        addFormValidation(form);
    });
}

function addFormValidation(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        // Add event listeners for real-time validation
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
        
        // Special handling for password confirmation
        if (input.name === 'confirmPassword') {
            input.addEventListener('input', () => validatePasswordMatch(input));
        }
        
        // Special handling for email
        if (input.type === 'email') {
            input.addEventListener('input', () => validateEmailFormat(input));
        }
    });
    
    // Add form submit validation
    form.addEventListener('submit', (e) => {
        if (!validateForm(form)) {
            e.preventDefault();
        }
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    const fieldType = field.type;
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = `${getFieldLabel(field)} is required`;
    }
    
    // Type-specific validation
    if (value && isValid) {
        switch (fieldType) {
            case 'email':
                if (!isValidEmail(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
                
            case 'password':
                if (value.length < 8) {
                    isValid = false;
                    errorMessage = 'Password must be at least 8 characters long';
                } else if (!isStrongPassword(value)) {
                    isValid = false;
                    errorMessage = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
                }
                break;
                
            case 'tel':
                if (!isValidPhone(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
                break;
        }
    }
    
    // Field-specific validation
    if (value && isValid) {
        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters long';
                } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Name can only contain letters, spaces, hyphens, and apostrophes';
                }
                break;
                
            case 'confirmPassword':
                const passwordField = field.form.querySelector('input[name="password"]');
                if (passwordField && value !== passwordField.value) {
                    isValid = false;
                    errorMessage = 'Passwords do not match';
                }
                break;
                
            case 'age':
                const age = parseInt(value);
                if (age < 13 || age > 120) {
                    isValid = false;
                    errorMessage = 'Please enter a valid age between 13 and 120';
                }
                break;
        }
    }
    
    // Show or clear error
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

function validateForm(form) {
    const fields = form.querySelectorAll('input, textarea, select');
    let isFormValid = true;
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });
    
    // Check for required checkboxes (like terms of service)
    const requiredCheckboxes = form.querySelectorAll('input[type="checkbox"][required]');
    requiredCheckboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            isFormValid = false;
            showNotification(`Please accept the ${getFieldLabel(checkbox)}`);
        }
    });
    
    return isFormValid;
}

function validateEmailFormat(emailField) {
    const email = emailField.value.trim();
    if (email && !isValidEmail(email)) {
        showFieldError(emailField, 'Please enter a valid email address');
        return false;
    } else {
        clearFieldError(emailField);
        return true;
    }
}

function validatePasswordMatch(confirmField) {
    const passwordField = confirmField.form.querySelector('input[name="password"]');
    const password = passwordField ? passwordField.value : '';
    const confirmPassword = confirmField.value;
    
    if (confirmPassword && password !== confirmPassword) {
        showFieldError(confirmField, 'Passwords do not match');
        return false;
    } else {
        clearFieldError(confirmField);
        return true;
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    // Check if it's a valid length (10-15 digits)
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
}

function isStrongPassword(password) {
    // At least 8 characters, one uppercase, one lowercase, one number
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return strongPasswordRegex.test(password);
}

function showFieldError(field, message) {
    const fieldGroup = field.closest('.form-group') || field.parentElement;
    let errorElement = fieldGroup.querySelector('.error-message');
    
    // Create error element if it doesn't exist
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        fieldGroup.appendChild(errorElement);
    }
    
    // Add error styling
    fieldGroup.classList.add('error');
    field.classList.add('error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Add error styling to field
    field.style.borderColor = '#e74c3c';
}

function clearFieldError(field) {
    const fieldGroup = field.closest('.form-group') || field.parentElement;
    const errorElement = fieldGroup.querySelector('.error-message');
    
    // Remove error styling
    fieldGroup.classList.remove('error');
    field.classList.remove('error');
    field.style.borderColor = '';
    
    if (errorElement) {
        errorElement.style.display = 'none';
        errorElement.textContent = '';
    }
}

function getFieldLabel(field) {
    // Try to find associated label
    const label = field.form.querySelector(`label[for="${field.id}"]`) || 
                  field.closest('.form-group')?.querySelector('label') ||
                  field.previousElementSibling;
    
    if (label && label.tagName === 'LABEL') {
        return label.textContent.replace(':', '').trim();
    }
    
    // Fallback to field name or placeholder
    return field.getAttribute('placeholder') || 
           field.name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) ||
           'This field';
}

// Credit card validation
function validateCreditCard(cardNumber) {
    // Remove spaces and dashes
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');
    
    // Check if it's all digits
    if (!/^\d+$/.test(cleanNumber)) {
        return { isValid: false, message: 'Card number must contain only digits' };
    }
    
    // Check length
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
        return { isValid: false, message: 'Card number must be between 13 and 19 digits' };
    }
    
    // Luhn algorithm check
    if (!luhnCheck(cleanNumber)) {
        return { isValid: false, message: 'Invalid card number' };
    }
    
    // Determine card type
    const cardType = getCardType(cleanNumber);
    
    return { isValid: true, cardType: cardType };
}

function luhnCheck(cardNumber) {
    let sum = 0;
    let isEven = false;
    
    // Loop through values starting from the right
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i));
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

function getCardType(cardNumber) {
    const patterns = {
        visa: /^4/,
        mastercard: /^5[1-5]/,
        amex: /^3[47]/,
        discover: /^6(?:011|5)/,
        diners: /^3[0689]/,
        jcb: /^35/
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
        if (pattern.test(cardNumber)) {
            return type;
        }
    }
    
    return 'unknown';
}

// CVV validation
function validateCVV(cvv, cardType) {
    const cleanCVV = cvv.replace(/\D/g, '');
    
    if (cardType === 'amex') {
        return cleanCVV.length === 4;
    } else {
        return cleanCVV.length === 3;
    }
}

// Expiry date validation
function validateExpiryDate(month, year) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const expMonth = parseInt(month);
    const expYear = parseInt(year);
    
    if (expMonth < 1 || expMonth > 12) {
        return { isValid: false, message: 'Invalid month' };
    }
    
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        return { isValid: false, message: 'Card has expired' };
    }
    
    return { isValid: true };
}

// Export validation functions for use in other files
window.validationUtils = {
    validateField,
    validateForm,
    validateEmailFormat,
    validatePasswordMatch,
    isValidEmail,
    isValidPhone,
    isStrongPassword,
    validateCreditCard,
    validateCVV,
    validateExpiryDate,
    showFieldError,
    clearFieldError
};
