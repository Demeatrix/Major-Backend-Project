import mongoose from "mongoose";
import momgooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            type: String,
            required: true,
        },

        thumbnail: {
            type: String,
            required: true,
        }, 

        title: {
            type: String,
            require: true,   
        },

        description: {
            type: String,
            required: true,
        },

        duration: {
            type: Number,
            required: true,
        },

        views: {
            type: Number,
            default: 0,
        },

        isPublished: {
            type: Boolean,
            default: true,
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }

    },
    {
        timestamps: true
    }
)

videoSchema.plugin(momgooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)