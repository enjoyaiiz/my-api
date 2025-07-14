const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true },
    locationText: String,
    budget: String,
    startDate: Date,
    endDate: Date,
    ownerFirstName: { type: String, required: true },
    ownerLastName: { type: String, required: true },
    ownerPhone: { type: String, required: true },
    ownerLineId: String,
    location: {
      lat: Number,
      lng: Number,
    },
    status: {
      type: String,
      required: true,
      enum: ["open", "in-progress", "closed"], // ถ้าอยากจำกัดค่า
      default: "open",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
      },
    },
  }
);

module.exports = mongoose.model('Project', projectSchema);
