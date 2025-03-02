// ValidationUtils.ts
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../constants/firebaseConfig"; // Adjust this path based on your project structure

// Validate Name (synchronous)
export const validateName = (
  name: string,
  setNameError: (error: string) => void
): boolean => {
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

// Validate Username with duplicate check (asynchronous)
export const validateUsername = async (
  username: string,
  setUsernameError: (error: string) => void
): Promise<boolean> => {
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

  // Check Firestore for duplicate username
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", username));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    setUsernameError("Username already exists. Please choose a different username.");
    return false;
  }

  setUsernameError("");
  return true;
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

  // Check Firestore for duplicate email
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    setEmailError("Email already exists. Please use a different email.");
    return false;
  }

  setEmailError("");
  return true;
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

  // Check Firestore for duplicate phone number
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("phone", "==", phone));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    setPhoneError("Phone number already exists. Please use a different number.");
    return false;
  }

  setPhoneError("");
  return true;
};