import * as yup from "yup";

export const loginSchema = yup.object().shape({
    username: yup
        .string()
        .required("Username is required")
        .min(3, "Username must be at least 3 characters long")
        .max(20, "Username cannot exceed 20 characters"),

    password: yup
        .string()
        .required("Password is required")
        // .min(8, "Password must be at least 8 characters long")
        // .max(50, "Password cannot exceed 50 characters")
        // .matches(/[a-zA-Z]/, "Password must contain at least one letter")
        // .matches(/\d/, "Password must contain at least one number")
        // .matches(/[@$!%*?&]/, "Password must contain at least one special character (@, $, !, %, *, ?, &)"),
}); 