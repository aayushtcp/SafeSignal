import * as yup from "yup"

export const disasterFormSchema = yup.object().shape({
  requester_name: yup
    .string()
    .required("Name is required")
    .min(7, "Name must be at least 7 characters")
    .test("word-count", "Name must be between 2 and 3 words", (value) => {
      if (!value) return false
      const words = value.trim().split(/\s+/)
      return words.length >= 2 && words.length <= 3
    })
    .test("no-single-numeric", "Name must not contain single numeric values", (value) => {
      if (!value) return false
      const words = value.trim().split(/\s+/)
      return words.every(word => !/^\d+$/.test(word))
    })
    .test("no-numeric-anywhere", "Name must not contain any numeric values", (value) => {
      if (!value) return false
      // No digit allowed anywhere in the name
      return !/\d/.test(value)
    }),

  help_type: yup
    .string()
    .required("Please select the type of help you need")
    .oneOf(["Money", "Food", "Both"], "Invalid help type selected"),

  latitude: yup.number().required("Location is required").notOneOf([0], "Please provide your location"),

  longitude: yup.number().required("Location is required").notOneOf([0], "Please provide your location"),

  images: yup
    .array()
    .of(
      yup
        .mixed()
        .test("fileSize", "Each image must be below 5MB", (value) => {
          if (!value) return true
          return value.size <= 5 * 1024 * 1024 // 5MB in bytes
        })
        .test("fileType", "Only PNG, JPG, and JPEG images are allowed", (value) => {
          if (!value) return true
          const allowedTypes = ["image/png", "image/jpg", "image/jpeg"]
          return allowedTypes.includes(value.type)
        }),
    )
    .max(4, "You can upload maximum 4 images"),
})
