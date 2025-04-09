// Purpose: To send consistent responses from the backend.
// Why? Instead of manually writing { success: true, data: ... } in every route, we use this helper class.

// examples to refer:

// User Found

// {
//   "statusCode": 200,
//   "data": { "id": 1, "name": "John Doe" },
//   "message": "User fetched successfully",
//   "success": true
// }

// Item Created

// {
//   "statusCode": 201,
//   "data": { "id": 101, "product": "Laptop" },
//   "message": "Product added successfully",
//   "success": true
// }

// So, instead of manually writing these response objects in every route, we just use ApiResponse.js!

class ApiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export { ApiResponse }