import mongoose, { Document, Schema } from 'mongoose';

export type PromptCategory =
  | 'Coding'
  | 'Marketing'
  | 'Content Writing'
  | 'Email'
  | 'Resume'
  | 'SQL'
  | 'Design'
  | 'Social Media'
  | 'Productivity'
  | 'Others';

export interface IPrompt extends Document {
  title: string;
  prompt: string;
  description?: string;
  category: PromptCategory;
  tags: string[];
  favorite: boolean;
  pinned: boolean;
  displayOrder: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PromptSchema = new Schema<IPrompt>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    prompt: {
      type: String,
      required: [true, 'Prompt content is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [400, 'Description cannot exceed 400 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Coding',
          'Marketing',
          'Content Writing',
          'Email',
          'Resume',
          'SQL',
          'Design',
          'Social Media',
          'Productivity',
          'Others',
        ],
        message: '{VALUE} is not a valid category',
      },
      default: 'Others',
    },
    tags: {
      type: [String],
      default: [],
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        ret.content = ret.prompt || ret.content;
        ret.isFavorite = ret.favorite !== undefined ? ret.favorite : ret.isFavorite;
        ret.isPinned = ret.pinned !== undefined ? ret.pinned : ret.isPinned;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret: any) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        ret.content = ret.prompt || ret.content;
        ret.isFavorite = ret.favorite !== undefined ? ret.favorite : ret.isFavorite;
        ret.isPinned = ret.pinned !== undefined ? ret.pinned : ret.isPinned;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for high performance querying
PromptSchema.index({ category: 1 });
PromptSchema.index({ favorite: 1 });
PromptSchema.index({ pinned: 1 });
PromptSchema.index({ displayOrder: 1 });
PromptSchema.index({ createdAt: -1 });

// Text index for search
PromptSchema.index({
  title: 'text',
  prompt: 'text',
  description: 'text',
  tags: 'text',
});

export const PromptModel = (mongoose.models.Prompt ||
  mongoose.model<IPrompt>('Prompt', PromptSchema)) as mongoose.Model<IPrompt>;
