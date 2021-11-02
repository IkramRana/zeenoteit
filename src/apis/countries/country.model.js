const mongoose = require("mongoose");

const CountrySchema = new mongoose.Schema({
  code: {
    type: String,
    maxlength: 20,
    unique: true,
    required: true,
  }, 
  image_path: {
    type: String,
    maxlength: 255,
    required: true,
  },
  number_length: {
    type: String,
    maxlength: 10,
    required: true,
  },
  creationAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
});

const Country = mongoose.model("countries", CountrySchema);

module.exports = Country;

module.exports.get = function (callback, limit) {
  Country.find(callback).limit(limit);
}