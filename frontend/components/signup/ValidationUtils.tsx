export const validateName = (name: string, setNameError: (error: string) => void): boolean => {
  const nameRegex = /^[A-Za-z]+$/;

  if (!name) {
    setNameError("Name is required.");
    return false;
  }

  if (!nameRegex.test(name)) {
    setNameError("Name can only contain alphabets.");
    return false;
  }

  setNameError("");
  return true;
};


export const validateUsername = (username: string, setUsernameError: (error: string) => void): boolean => {
  const usernameRegex = /^(?![._])([A-Za-z0-9]+[A-Za-z0-9._]*[A-Za-z0-9]){3,20}$/;

  if (!username) {
    setUsernameError("Username is required.");
    return false;
  }

  if (!usernameRegex.test(username)) {
    setUsernameError(
      "Username must be between 3 and 20 characters, and can only contain letters, numbers, periods, or underscores."
    );
    return false;
  }

  setUsernameError("");
  return true;
};

export const validatePassword = (password: string, setError: (error: string) => void): boolean => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 8;

  if (!isLongEnough || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    setError(
      "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character"
    );
    return false;
  }
  
  setError("");
  return true;
};

export const validateEmail = (email: string, setError: (error: string) => void): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setError("Please enter a valid email address");
    return false;
  }
  setError("");
  return true;
};

export const validatePhone = (phone: string, setError: (error: string) => void): boolean => {
  const phoneRegex = /^[89][0-9]{7}$/; // Starts with 8 or 9 and followed by 7 digits
  if (!phoneRegex.test(phone)) {
    setError("Please enter a valid Singapore Phone Number (8/9xxxxxxx)");
    return false;
  }
  setError("");
  return true;
};
