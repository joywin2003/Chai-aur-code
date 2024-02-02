import { asyncHandler } from "../utils/asyncHanlder.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessTokenAndRefereshToken = async (userId) => {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ isValidateBeforeSave: false });

    return { accessToken, refreshToken };
};

const RegisterUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;
    console.log("email: ", email);

    if (
        [fullName, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }
    console.log("email: ", email);
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    console.log(1);
    // if (existedUser) {
    //     throw new ApiError(409, "User with email or username already exists");
    // }
    // const avatarLocalPath = req.files?.avatar[0]?.path;
    // // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // let coverImageLocalPath
    // console.log(coverImageLocalPath, avatarLocalPath);
    // if (
    //     req.files &&
    //     Array.isArray(req.files.coverImage) &&
    //     req.files.coverImage.length > 0
    // ) {
    //     coverImageLocalPath = req.files.coverImage[0].path;
    // }
    // console.log(4);
    // if (!avatarLocalPath) {
    //     throw new ApiError(400, "Avatar file is required");
    // }
    // console.log(5);
    // const avatar = await uploadOnCloudinary(avatarLocalPath);
    // const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // if (!avatar) {
    //     throw new ApiError(400, "Avatar file is required");
    // }
    // console.log(6);
    const user = await User.create({
        fullName,
        // avatar: avatar.url||"",
        // coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });
    console.log(7);
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User registered Successfully")
        );
});

const LoginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        throw new ApiError(400, "Username and password are required");
    }
    const user = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Password is incorrect");
    }

    const { accessToken, refreshToken } =
        await generateAccessTokenAndRefereshToken(user._id);

    const LoggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        htmlOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: LoggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        );
});

export { RegisterUser };
