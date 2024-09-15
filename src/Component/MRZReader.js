import React, { useState } from "react";
import Tesseract from "tesseract.js";

const MrzReader = () => {
  const [image, setImage] = useState(null);
  const [mrzData, setMrzData] = useState("");
  const [parsedMrz, setParsedMrz] = useState({});
  const [loading, setLoading] = useState(false);

  // Handle file input change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setImage(imageURL);
    }
  };

  // Preprocess the image using canvas (crop and thresholding)
  const preprocessImage = (imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageUrl;
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Crop the MRZ section (approximate the bottom 20% of the image)
        const cropY = img.height * 0.75; // Adjust this value as needed
        const cropHeight = img.height * 0.25;
        canvas.width = img.width;
        canvas.height = cropHeight;

        // Draw and crop the image
        ctx.drawImage(img, 0, cropY, img.width, cropHeight, 0, 0, canvas.width, canvas.height);

        // Apply grayscale
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const grayscale = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = data[i + 1] = data[i + 2] = grayscale;
        }
        ctx.putImageData(imageData, 0, 0);

        // Apply thresholding (binary conversion)
        for (let i = 0; i < data.length; i += 4) {
          const grayscale = data[i];
          const binary = grayscale > 128 ? 255 : 0; // Thresholding value
          data[i] = data[i + 1] = data[i + 2] = binary;
        }
        ctx.putImageData(imageData, 0, 0);

        // Convert to data URL and resolve
        resolve(canvas.toDataURL());
      };
    });
  };
  // Parse MRZ data using regex
  const parseMrz = (text) => {
    console.log("Raw MRZ Text: ", text); // Log the raw text for inspection
    
    const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    console.log("Parsed Lines: ", lines); // Log the parsed lines
    
    if (lines.length >= 2) {
      const line1 =  lines[0];
      const line2 = lines[1];
      
      // MRZ line 1 regex
      const line1Regex = /^([A-Z<]{2})([A-Z<]{3})([A-Z<]+)<<([A-Z<]+)$/;
      const line2Regex = /^([A-Z0-9<]{9})([0-9]{6})([MF<])([0-9]{6})([A-Z0-9<]{10})([0-9<]+)$/;
      
      const line1Match = line1.match(line1Regex);
      const line2Match = line2.match(line2Regex);
  
      if (line1Match) {
        return {
          documentType: line1Match[1].replace(/</g, ''),
          issuingCountry: line1Match[2].replace(/</g, ''),
          surname: line1Match[3].replace(/</g, ' '),
          givenNames: line1Match[4].replace(/</g, ' '),
        //   passportNumber: line2Match[1].replace(/</g, ''),
        //   birthDate: line2Match[2],
        //   gender: line2Match[3],
        //   expirationDate: line2Match[4],
        //   nationality: line2Match[5],
        };
      } else {
        console.error("Regex match failed");
      }
    } else {
      console.error("Insufficient lines in MRZ text");
    }
  };
  // Process the image for MRZ data
  const handleReadMrz = async () => {
    if (!image) return;

    setLoading(true);
    const preprocessedImage = await preprocessImage(image);

    Tesseract.recognize(
      preprocessedImage,
      'eng', // Only recognize English characters
      {
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<', // MRZ character set
        psm: 6, // Assume block of text (use other psm if needed)
      }
    )
      .then(({ data: { text } }) => {
        debugger;
        setMrzData(text); 
        setParsedMrz(parseMrz(text));
        console.log("Extracted Text: ", text);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error reading MRZ:", err);
        setLoading(false);
      });
  };

  return (
    <div>
      <h1>MRZ Reader</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {image && (
        <div>
          <img src={image} alt="Passport" style={{ width: "300px" }} />
          <button onClick={handleReadMrz} disabled={loading}>
            {loading ? "Processing..." : "Read MRZ"}
          </button>
        </div>
      )}
      {mrzData && (
        <div>
          <h3>Extracted MRZ Data:</h3>
          <pre>{mrzData}</pre>
        </div>
      )}
      {parsedMrz && (
        <div>
          <h3>Parsed MRZ Information:</h3>
          <p>Document Type: {parsedMrz.documentType}</p>
          <p>Issuing Country: {parsedMrz.issuingCountry}</p>
          <p>Surname: {parsedMrz.surname}</p>
          <p>Given Names: {parsedMrz.givenNames}</p>
          <p>Passport Number: {parsedMrz.passportNumber}</p>
          <p>Birth Date: {parsedMrz.birthDate}</p>
          <p>Gender: {parsedMrz.gender}</p>
          <p>Expiration Date: {parsedMrz.expirationDate}</p>
          <p>Nationality: {parsedMrz.nationality}</p>
        </div>
      )}
    </div>
  );
  
};

export default MrzReader;


