export const validateSignup = (req, res, next) => {
  const { firstName, lastName, username, password, confirmPassword, age } =
    req.body;
  const errors = {};

  if (!firstName || firstName.trim().length < 3) {
    errors.firstName = "First name must contain at least 3 characters.";
  }

  if (!lastName || lastName.trim().length < 3) {
    errors.lastName = "Last name must contain at least 3 characters.";
  }

  if (!username || username.trim().length < 3) {
    errors.username = "Username must contain at least 3 characters.";
  }

  if (!password) {
    errors.password = "Please enter a password.";
  } else {
    if (password.length < 4) {
      errors.password = "Password must contain at least 4 characters.";
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      errors.password = "Password must contain both letters and numbers.";
    }
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  const ageNumber = Number(age);
  if (!age) {
    errors.age = "Please specify your age.";
  } else if (isNaN(ageNumber)) {
    errors.age = "Age must be a number.";
  } else if (ageNumber <= 0) {
    errors.age = "Age cannot be zero or negative.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};
