const mongoose = require("mongoose");

const companyDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
  },
  companyName: {
    type: String,
  },
  dbaName: {
    type: String,
  },
  websiteUrl: {
    type: String,
  },
  sector: {
    type: String,
  },
  specialization: {
    type: String,
  },
  businessModel: {
    type: [String],
  },
  revenueStream: {
    type: [String],
  },
  dateFounded: {
    type: Date,
  },
  companyRegNo: {
    type: String,
  },
  country: {
    type: String,
  },
  city: {
    type: String,
  },
  contactPersonName: {
    type: String,
  },
  contactEmail: {
    type: String,
  },
  companyPhone: {
    type: String,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

mongoose.model("CompanyDetail", companyDetailsSchema);
