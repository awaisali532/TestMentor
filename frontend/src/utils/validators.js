export const validatePassword = (password, email) => {
  // 1. Check Length
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  // 2. Check Complexity (Broken down for reliability)
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  // [\W_] checks for ANY special character (!, @, #, $, %, ^, &, *, (, ), -, _, etc.)
  const hasSpecialChar = /[\W_]/.test(password);

  if (!hasLowerCase) return "Add at least one lowercase letter (a-z).";
  if (!hasUpperCase) return "Add at least one uppercase letter (A-Z).";
  if (!hasNumber) return "Add at least one number (0-9).";
  if (!hasSpecialChar)
    return "Add at least one special character (!, @, #, $, etc.).";

  // 3. Check Email Match
  if (email && password === email) {
    return "Password cannot be the same as your email address.";
  }

  return null; // All checks passed
};
