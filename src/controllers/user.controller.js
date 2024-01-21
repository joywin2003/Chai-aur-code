import { asyncHandler } from "../utils/asyncHanlder.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

const RegisterUser = asyncHandler(async (req, res) => {
    const { username, email, fullName, password } = req.body;
    if (
        [username, email, fullName, password].some(
            (feild) => feild?.trim() === ""
        )
    ) {
        res.status(400);
        throw new ApiError("All feilds are required");
    }
    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existingUser) {
        res.status(400);
        throw new ApiError("User already exists");
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;

    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if (createdUser) {
        return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    createdUser,
                    "User registered Successfully"
                )
            );
    } else {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }
});

export { RegisterUser };
