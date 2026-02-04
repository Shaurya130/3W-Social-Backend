import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const pollOptionSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  votes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  ]
});

const postSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["POST", "POLL", "PROMOTION"],
      required: true
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    content: String,
    image: String,

    poll: {
      question: {
        type: String,
        required: function () {
          return this.type === "POLL";
        }
      },

      options: {
        type: [pollOptionSchema],
        required: function () {
          return this.type === "POLL";
        },
        validate: {
          validator: function (arr) {
            if (this.type !== "POLL") return true;
            return Array.isArray(arr) && arr.length >= 2;
          },
          message: "Poll must have at least 2 options"
        }
      },

      expiresAt: Date
    },

    promotion: {
      title: String,
      description: String,
      buttonText: String,
      buttonLink: String,
      websiteLink: String
    },

    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    comments: [commentSchema],

    shares: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);


export const Post = mongoose.model("Post", postSchema);
