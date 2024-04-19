export class FormValidationFailedError extends Error {
  message: string = 'Form validation failed'
  constructor(message?: string) {
    super()
    if (message) {
      this.message = message
    }
  }
}
