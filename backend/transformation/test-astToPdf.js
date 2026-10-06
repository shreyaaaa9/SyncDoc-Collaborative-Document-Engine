const assert = require("assert");
const fs = require("fs");
const path = require("path");

const { astToPdf } = require("./astToPdf");

console.log("===== AST → PDF TEST =====");

const outputDir = path.join(__dirname, "test-output");
const outputPath = path.join(outputDir, "sample-document.pdf");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const ast = {
  type: "root",
  children: [
    {
      type: "heading",
      depth: 1,
      children: [
        {
          type: "text",
          value: "SyncDoc"
        }
      ]
    },
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "This is a collaborative document."
        }
      ]
    },
    {
      type: "heading",
      depth: 2,
      children: [
        {
          type: "text",
          value: "Features"
        }
      ]
    },
    {
      type: "list",
      ordered: false,
      children: [
        {
          type: "listItem",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "Real-time editing"
                }
              ]
            }
          ]
        },
        {
          type: "listItem",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "Conflict detection"
                }
              ]
            }
          ]
        },
        {
          type: "listItem",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "AST comparison"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      type: "code",
      lang: "javascript",
      value: 'const message = "Hello SyncDoc";\nconsole.log(message);'
    }
  ]
};

astToPdf(ast, outputPath)
  .then((filePath) => {
    console.log("PDF generated:", filePath);

    assert(fs.existsSync(filePath), "PDF file was not created");

    const stats = fs.statSync(filePath);

    assert(stats.size > 0, "PDF file is empty");

    console.log("PDF file exists and is not empty");
    console.log("File size:", stats.size, "bytes");

    console.log("AST → PDF TEST PASSED");
  })
  .catch((error) => {
    console.error("AST → PDF TEST FAILED");
    console.error(error);
    process.exit(1);
  });
