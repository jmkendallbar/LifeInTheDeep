const fs = require("fs");
const csvParser = require("csv-parser");

const inputFilePath = "./data/09_Hypnotrack_1Hz_ALL_ANIMALS.csv";
const outputDirectory =
  "C:\\Users\\HP\\Desktop\\development\\visualising-life-in-the-deep\\LifeInTheDeep\\seal-info\\";
const batchSize = 2000; // Set the desired batch size

fs.mkdirSync(outputDirectory, { recursive: true }); // Create output directory if it doesn't exist

const inputStream = fs.createReadStream(inputFilePath);

let batchCounter = 0;
let currentBatch = [];

inputStream
  .pipe(csvParser()) // Use a CSV parser to read the input CSV file
  .on("data", (data) => {
    // Apply your transformation logic here
    if (data.SealID === "test33_HypoactiveHeidi") {
      // Modify the data as needed
      // data.newField = "newValue";
      currentBatch.push(data);
    }

    // Check if the current batch is full
    if (currentBatch.length >= batchSize) {
      writeBatchToFile();
    }
  })
  .on("end", () => {
    // Write any remaining data to the last file
    if (currentBatch.length > 0) {
      writeBatchToFile();
    }
    console.log("Data processing completed.");
  });

function writeBatchToFile() {
  batchCounter++;

  const outputFile = `${outputDirectory}batch_${batchCounter}.json`;

  fs.writeFileSync(
    outputFile,
    JSON.stringify(currentBatch, null, 2), // Indent for readability
    "utf-8"
  );

  console.log(`Batch ${batchCounter} written to ${outputFile}`);

  // Clear the current batch for the next set of records
  currentBatch = [];
}
