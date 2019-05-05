const request = require('request');
const AWS = require('aws-sdk');
const image2base64 = require("image-to-base64");

const rek = new AWS.Rekognition({
  region: process.env.AWS_REGION
});

const downloadUrlImageBase64 = async url => {
  return await image2base64(url) // you can also to use url
    .then(response => {
      return response;
    })
    .catch(error => {
      console.log("error base64");
      console.log(error); //Exepection error....
    });
};

class ImageAnalyser {

  static getImageLabelArray(labels) {
    var listOfLabels = [];
    labels.forEach(function (label) {
      listOfLabels.push(label.Name);
    });
    return listOfLabels;
  }

  static async getImageLabels(url) {
    let base64Image = await downloadUrlImageBase64(url);
    const params = {
      Image: {
        Bytes: new Buffer.from(base64Image, 'base64')
      },
      MaxLabels: 2,
      MinConfidence: 50,
    };
    return new Promise((resolve, reject) => {
      rek.detectLabels(params, (err, data) => {
        if (err) {
          reject(new Error(err));
        }
        resolve(data.Labels);
      });
    });
  }
}

module.exports = ImageAnalyser;