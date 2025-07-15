import mongoose, { Schema } from 'mongoose';

const AnalyticsModel = () => {
  const analyticsSchema = new Schema({
    sessionId: { 
      type: String, 
      required: [true, 'sessionId is required'], 
      trim: true 
    },
    page: { 
      type: String, 
      required: [true, 'page is required'], 
      trim: true 
    },
    blogId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Blog', 
      required: [true, 'blogId is required'] 
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      default: null 
    },
    visitTime: { 
      type: Date, 
      required: [true, 'visitTime is required'], 
      default: Date.now 
    },
    exitTime: { 
      type: Date 
    },
    duration: { 
      type: Number, 
      default: null // Stored in seconds, set when exitTime is updated
    },
    deviceInfo: { 
      type: String, 
      required: [true, 'deviceInfo is required'], 
      trim: true 
    },
  }, {
    timestamps: true,
  });

  console.log('Analytics model created');
  return mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);
};

export default AnalyticsModel();