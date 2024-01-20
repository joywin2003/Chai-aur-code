import { asyncHandler } from "../utils/asyncHanlder.js";

const RegisterUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "Register User",
    });
});

export { RegisterUser };
