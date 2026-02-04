import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandle.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createPost = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const owner = req.user._id;

    const imageLocalPath = req.files?.image?.[0]?.path;
    
    if (!content?.trim() && !imageLocalPath) {
        throw new ApiError(400, "Post must contain either text or an image");
    }

    let imageUrl = "";
    if (imageLocalPath) {
        const uploadResult = await uploadOnCloudinary(imageLocalPath);
        imageUrl = uploadResult?.url || "";
    }

    const newPost = await Post.create({
        type: "POST",
        content: content || "",
        image: imageUrl,
        owner
    });

    return res.status(201).json(new ApiResponse(201, newPost, "Post created successfully"));
});


const createPoll = asyncHandler(async (req, res) => {
    const { question, options, expiresAt } = req.body;
    const owner = req.user._id;

    if (!question || !options || options.length < 2) {
        throw new ApiError(400, "Poll requires a question and at least 2 options");
    }


    const formattedOptions = options.map(optionText => ({ text: optionText, votes: [] }));

    const newPoll = await Post.create({
        type: "POLL",
        owner,
        poll: {
            question,
            options: formattedOptions,
            expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days
        }
    });

    return res.status(201).json(new ApiResponse(201, newPoll, "Poll created successfully"));
});


const createPromotion = asyncHandler(async (req, res) => {
    const { title, description, buttonText, buttonLink, websiteLink } = req.body;
    const owner = req.user._id;

    if (!title || !buttonLink) {
        throw new ApiError(400, "Title and Button Link are required for promotions");
    }

    const newPromotion = await Post.create({
        type: "PROMOTION",
        owner,
        promotion: {
            title,
            description,
            buttonText,
            buttonLink,
            websiteLink
        }
    });

    return res.status(201).json(new ApiResponse(201, newPromotion, "Promotion created successfully"));
});


const getAllFeed = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc", userId } = req.query;

    const filter = {
        ...(query && { content: { $regex: query, $options: "i" } }),
        ...(userId && { owner: userId }),
    };

    const sortOptions = {
        [sortBy]: sortType === "asc" ? 1 : -1,
    };

    const feed = await Post.find(filter)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("owner", "username") // post creator's username
        .populate("likes", "username") // usernames of people who liked
        .populate("comments.user", "username"); // usernames of commenters

    const total = await Post.countDocuments(filter);

    const formattedFeed = feed.map(post => {
        return {
            _id: post._id,
            type: post.type,
            username: post.owner?.username,
            content: post.content,
            image: post.image,
            poll: post.poll,
            promotion: post.promotion,
            // Requirements: Display counts and names
            likesCount: post.likes.length,
            likedBy: post.likes.map(u => u.username), 
            commentsCount: post.comments.length,
            comments: post.comments.map(c => ({
                username: c.user?.username,
                content: c.content
            }))
        };
    });

    try {
        return res.status(200).json(new ApiResponse(200, { feed: formattedFeed, total }, "Feed fetched successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Failed to fetch feed");
    }
});

const toggleLike = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) throw new ApiError(404, "Post not found");

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
        post.likes.pull(userId); // unlike
    } else {
        post.likes.push(userId); // like
    }

    await post.save();
    try {
        return res.status(200).json(new ApiResponse(200, {}, isLiked ? "unliked" : "liked"));
    } catch (error) {
        console.log(error); 
        throw new ApiError(500, "Failed to toggle like");
    }
});

const addComment = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content) throw new ApiError(400, "Comment content is required");

    const post = await Post.findByIdAndUpdate(
        postId,
        {
            $push: { comments: { content, user: req.user._id } }
        },
        { new: true }
    );

    return res.status(201).json(new ApiResponse(201, post.comments, "Comment added"));
});

const voteInPoll = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { optionId } = req.body;
    const userId = req.user._id;
    const post = await Post.findById(postId);

    if (!post || post.type !== "POLL") {
        throw new ApiError(404, "Poll not found");
    }
    const poll = post.poll;
    if (new Date() > new Date(poll.expiresAt)) {
        throw new ApiError(400, "Poll has expired");
    }
    const option = poll.options.id(optionId);
    if (!option) {
        throw new ApiError(404, "Option not found");
    }
    // Check if user has already voted
    for (let opt of poll.options) {
        if (opt.votes.includes(userId)) {
            throw new ApiError(400, "User has already voted in this poll");
        }
    }
    option.votes.push(userId);
    await post.save();
    return res.status(200).json(new ApiResponse(200, post.poll, "Vote recorded successfully"));
});

export {
    createPost,
    createPoll,
    createPromotion,
    getAllFeed,
    toggleLike,
    addComment,
    voteInPoll
};