import * as yup from "yup"

// Helper function to count words
const countWords = (str) => {
  return str.trim().split(/\s+/).filter(Boolean).length
}

// Valid disaster types
const DISASTER_TYPES = ["fire", "flood", "tornado", "landslide", "earthquake"]

// Image file validation
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export const disasterFormSchema = yup.object().shape({
  disasterType: yup
    .string()
    .required("Disaster type is required")
    .oneOf(DISASTER_TYPES, "Please select a valid disaster type"),

  disasterDescription: yup
    .string()
    .required("Disaster description is required")
    .min(10, "Description must be at least 10 characters long")
    .test("min-words", "Description must contain at least 5 words", (value) => countWords(value) >= 5)
    .test("starts-with-letter", "Description must start with a letter", (value) => /^[a-zA-Z]/.test(value)),

  // For file validation
  images: yup
    .array()
    .nullable()
    .test("fileFormat", "Unsupported file format. Only jpg, jpeg, and png are allowed", (value) => {
      if (!value || value.length === 0) return true
      return value.every((file) => SUPPORTED_FORMATS.includes(file.type))
    })
    .test("fileSize", "File size is too large", (value) => {
      if (!value || value.length === 0) return true
      return value.every((file) => file.size <= MAX_FILE_SIZE)
    })
    .test("maxFiles", "Maximum 4 images allowed", (value) => !value || value.length <= 4),

  // Location validation
  latitude: yup
    .number()
    .nullable()
    .when("autoLocation", {
      is: true,
      then: (schema) => schema.required("Location is required"),
      otherwise: (schema) => schema.nullable(),
    }),

  longitude: yup
    .number()
    .nullable()
    .when("autoLocation", {
      is: true,
      then: (schema) => schema.required("Location is required"),
      otherwise: (schema) => schema.nullable(),
    }),

  manualAddress: yup.string().when("autoLocation", {
    is: false,
    then: (schema) => schema.required("Address is required when using manual location"),
    otherwise: (schema) => schema.nullable(),
  }),

  autoLocation: yup.boolean().default(true),
})

// Export a function to validate the disaster description separately if needed
export const validateDisasterDescription = (description) => {
  try {
    // Check minimum length
    if (!description || description.length < 10) {
      return "Description must be at least 10 characters long"
    }

    // Check if it starts with a letter
    if (!/^[a-zA-Z]/.test(description)) {
      return "Description must start with a letter"
    }

    // Check word count
    if (countWords(description) < 5) {
      return "Description must contain at least 5 words"
    }

    return null // No errors
  } catch (error) {
    return "Invalid description format"
  }
}

// Export a function to validate image files separately if needed
export const validateImageFile = (file) => {
  if (!file) return null

  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return "Unsupported file format. Only jpg, jpeg, and png are allowed"
  }

  if (file.size > MAX_FILE_SIZE) {
    return "File size is too large (max 5MB)"
  }

  return null // No errors
}
