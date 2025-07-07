import mongoose, { Schema } from 'mongoose';

const AnalyticsModel = () => {
  const analyticsSchema = new Schema({
    sessionId: { type: String, required: true },
    page: { type: String, required: true },
    articleId: { type: Schema.Types.ObjectId, ref: 'Blog' },
    visitTime: { type: Date, required: true },
    exitTime: { type: Date },
    deviceInfo: { type: String, required: true },
  }, {
    timestamps: true,
  });

  console.log('Analytics model created');
  return mongoose.model('Analytics', analyticsSchema);
};

export default AnalyticsModel();