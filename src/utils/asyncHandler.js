const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((error) => 
            next(error))
    }
}

import { response } from "express"

export { asyncHandler }


// higher order function  -- with Try Catch
// const asyncHandler = (func) => async (req, res, next) => {
//     try {
//         await func(req, res, next)
//     } catch (error) {
//         response.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }