import { API_URL } from "../../config.json";

// Validate Name (synchronous)
export const validateName = (
  name: string,
  setNameError: (error: string) => void
): boolean => {
  const nameRegex = /^[A-Za-z\s]{1,20}$/;

  if (!name) {
    setNameError("Name is required.");
    return false;
  }
  if (name.length > 20) {
    setNameError("Name must be less than 20 characters.");
    return false;
  }
  if (!nameRegex.test(name)) {
    setNameError("Name can only contain alphabets and spaces.");
    return false;
  }
  setNameError("");
  return true;
};

// Validate Username with duplicate check (asynchronous)
export const validateUsername = async (
  username: string,
  setUsernameError: (error: string) => void
): Promise<boolean> => {
  const usernameRegex = /^[A-Za-z]{3,20}$/;

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

  try {
    // Use the API endpoint to check for duplicate username
    const response = await fetch(`${API_URL}/user/check-username/${encodeURIComponent(username)}`);
    
    // Only proceed with JSON parsing if the response is OK
    if (response.ok) {
      const data = await response.json();
      
      if (!data.available) {
        setUsernameError("Username already exists. Please choose a different username.");
        return false;
      }
      
      setUsernameError("");
      return true;
    } else {
      // Handle non-OK responses (like 404, 500, etc.)
      console.warn(`API error: ${response.status} when checking username`);
      setUsernameError("Unable to verify username availability.");
      return true; // Allow user to proceed with a warning
    }
  } catch (error) {
    console.error("Error checking username:", error);
    setUsernameError("Unable to verify username availability.");
    return true; // Allow user to proceed with a warning
  }
};

// Validate Email with duplicate check (asynchronous)
export const validateEmail = async (
  email: string,
  setEmailError: (error: string) => void
): Promise<boolean> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setEmailError("Please enter a valid email address");
    return false;
  }

  try {
    // Use the API endpoint to check for duplicate email
    const response = await fetch(`${API_URL}/user/check-email/${encodeURIComponent(email)}`);
    
    // Only proceed with JSON parsing if the response is OK
    if (response.ok) {
      const data = await response.json();
      
      if (!data.available) {
        setEmailError("Email already exists. Please use a different email.");
        return false;
      }
      
      setEmailError("");
      return true;
    } else {
      // Handle non-OK responses
      console.warn(`API error: ${response.status} when checking email`);
      setEmailError("Unable to verify email availability.");
      return true; // Allow user to proceed with a warning
    }
  } catch (error) {
    console.error("Error checking email:", error);
    setEmailError("Unable to verify email availability.");
    return true; // Allow user to proceed with a warning
  }
};

// Validate Password (synchronous)
export const validatePassword = (
  password: string,
  setPasswordError: (error: string) => void
): boolean => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 8;

  if (!isLongEnough || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    setPasswordError(
      "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character"
    );
    return false;
  }
  setPasswordError("");
  return true;
};

// Validate Phone Number with duplicate check (asynchronous)
export const validatePhone = async (
  phone: string,
  setPhoneError: (error: string) => void
): Promise<boolean> => {
  const phoneRegex = /^[89][0-9]{7}$/; // Starts with 8 or 9 and followed by 7 digits

  // Check format first
  if (!phoneRegex.test(phone)) {
    setPhoneError("Please enter a valid Singapore mobile number");
    return false;
  }

  try {
    // Use the API endpoint to check for duplicate phone
    const response = await fetch(`${API_URL}/user/check-phone/${encodeURIComponent(phone)}`);
    
    // Only proceed with JSON parsing if the response is OK
    if (response.ok) {
      const data = await response.json();
      
      if (!data.available) {
        setPhoneError("Phone number already exists. Please use a different number.");
        return false;
      }
      
      setPhoneError("");
      return true;
    } else {
      // Handle non-OK responses
      console.warn(`API error: ${response.status} when checking phone`);
      setPhoneError("Unable to verify phone number availability.");
      return true; // Allow user to proceed with a warning
    }
  } catch (error) {
    console.error("Error checking phone:", error);
    setPhoneError("Unable to verify phone number availability.");
    return true; // Allow user to proceed with a warning
  }
};