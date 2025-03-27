
// It is a wrapper function that helps handle errors in async functions inside Express routes. In Express, if you use async functions and an error occurs, you must use next(err) to pass the error to Express. It wraps async functions and automatically catches errors, passing them to next(err).

// Purpose: To automatically catch errors in async functions.
// Why? Without this, you have to write try...catch in every async route.

const asyncHandler = (requestHandler) => {
    (req, res, next) =>{
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export {asyncHandler}


// const asyncHandler =  () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}
// sunc isa function passed as parameter


/*  1 - way
const asyncHandler = (fn) => async (req, res, next) =>{
    try{
        await fn(req, res, next)
    } catch{
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
} 
*/