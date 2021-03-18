const mongoose = require("mongoose");

const companyDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
  },
  companyName: {
    type: String,
  },
  sector: {
    type: String,
  },
  specialization: {
    type: String,
  },
  technology: {
    type: String,
  },
  businessModel: {
    type: String,
  },
  country: {
    type: String,
  },
  state: {
    type: String,
  },
  city: {
    type: String,
  },
  pinCode: {
    type: String,
  },
  contactPerson: {
    type: String,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

mongoose.model("CompanyDetail", companyDetailsSchema);
