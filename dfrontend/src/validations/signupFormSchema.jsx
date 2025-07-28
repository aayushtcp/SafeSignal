import * as yup from "yup"

export const signupFormSchema = yup.object().shape({
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username cannot exceed 20 characters")
    .matches(/^[a-zA-Z][a-zA-Z0-9_]*$/, "Username must start with a letter and can only contain letters, numbers, and underscores")
    .test(
      "min-4-alphabets",
      "Username must contain at least 4 alphabetic characters",
      value => (value && (value.match(/[a-zA-Z]/g) || []).length >= 4)
    )
    .test(
      "max-3-numbers",
      "Username cannot contain more than 3 numeric characters",
      value => !value || (value.match(/\d/g) || []).length <= 3
    ),

  email: yup
    .string()
    .email("Invalid email format")
    .matches(
      /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|yahoo)\.com$/,
      "Email must be a gmail, hotmail, or yahoo address"
    )
    .required("Email is required"),

  user_type: yup
    .string()
    .oneOf(["Normal", "Organization"], "User type must be either Normal or Organization")
    .required("User type is required"),

  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password cannot exceed 32 characters")
    .matches(/[a-zA-Z]/, "Password must contain at least one letter")
    .matches(/\d/, "Password must contain at least one number")
    .matches(/[@$!%*?&#]/, "Password must contain at least one special character (@, $, !, %, *, ?, &, #)"),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
})

export default signupFormSchema
