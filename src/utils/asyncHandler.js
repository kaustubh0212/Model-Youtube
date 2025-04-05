// It is a wrapper function that helps handle errors in async functions inside Express routes. In Express, if you use async functions and an error occurs, you must use next(err) to pass the error to Express. It wraps async functions and automatically catches errors, passing them to next(err).



const asyncHandler = (requestHandler) => {
    return (req, res, next) =>{
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export {asyncHandler}
// RequestHandler is a function

// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}
// sunc isa function passed as parameter

// Why? Without this, you have to write try...catch in every async route.
// WE HAD TO USE THE BELOW SYNTAX FOR EVERY AWAIT FUNCTION IF WE DIDNT CREATE ASYNC HANDLER
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

OR

app.get("/users", async (req, res, next) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        next(error); // Pass error to Express error handler
    }
});

*/