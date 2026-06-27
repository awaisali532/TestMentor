// --- 1. Validate Email ---
export const validateEmail = (email) => {
  if (!email) return "Email is required.";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email address format.";
  }

  // Strict Gmail Check
  if (!email.toLowerCase().endsWith("@gmail.com")) {
    return "Only Google (@gmail.com) accounts are allowed.";
  }

  return null;
};

// --- 2. Validate Password ---
export const validatePassword = (password) => {
  if (!password) return "Password is required.";

  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one Uppercase letter (A-Z).";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one Lowercase letter (a-z).";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one Number (0-9).";
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "Password must contain at least one Special Character (!@#$).";
  }

  return null;
};

// --- 3. Validate Register ---
export const validateRegisterInput = (name, email, password) => {
  if (!name || name.trim().length === 0) {
    return "Full Name is required.";
  }

  const emailError = validateEmail(email);
  if (emailError) return emailError;

  const passwordError = validatePassword(password);
  if (passwordError) return passwordError;

  return null; // Sab theek hai
};
