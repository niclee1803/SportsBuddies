import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  statusBarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 20,
  },
  statusBarStep: {
    flex: 1,
    height: 5,
    marginHorizontal: 3,
    borderRadius: 5,
  },
  inputContainer: {
    marginBottom: 15,
  },
  eyeIcon: { 
    position: "absolute", 
    right: 10, 
    top: 30 
  },
  disabledButton: { 
    backgroundColor: "#ccc" 
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  navButton: { 
    padding: 10, 
    backgroundColor: "#ddd", 
    borderRadius: 5 
  },
  navButtonText: { 
    fontSize: 16 
  },
  signupButton: { 
    backgroundColor: "#42c8f5", 
    padding: 10, 
    borderRadius: 5 
  },
  signupButtonText: { 
    color: "#fff", 
    fontWeight: "bold" 
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    height: 40,
    backgroundColor: "#fff",
    width: "100%",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5, 
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  subheading: { 
    fontSize: 16, 
    marginBottom: 20 
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  halfInputContainer: { 
    width: "48%" 
  },
  haveAnAccountText: { 
    fontSize: 14 
  },
  loginButtonText: {
    color: "#42c8f5",
    fontSize: 14,
    fontWeight: "normal",
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    marginBottom: 20,
  },
  termsText: { 
    fontSize: 14 
  },
  termsLink: {
    fontSize: 14,
    color: "#42c8f5",
    textDecorationLine: "underline",
  },
  view: { 
    marginTop: 100, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  headingContainer: { 
    alignItems: "center", 
    marginBottom: 10 
  },
  heading: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 20 
  },
  heading2: { 
    fontSize: 16, 
    marginBottom: 20 
  },
  formContainer: {
    width: 400,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
});

export default styles;
