// to overwrite error messages
// to handle API Errors in a structured way

// Examples:

// User Not Found (404 - Not Found)
// {
//   "statusCode": 404,
//   "message": "User not found",
//   "errors": [],
//   "success": false
// }

// Unauthorized Access (401 - Unauthorized)
// {
//   "statusCode": 401,
//   "message": "Unauthorized! Please log in.",
//   "errors": [],
//   "success": false
// }

class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack  = ""
    ){  // overwritng the details
        super(message) // super(message) is used inside a class constructor to call the parent class's constructor (Error in this case).
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false  // flag
        this.errors = errors

        if(stack){
            this.stack = statck
        } else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }