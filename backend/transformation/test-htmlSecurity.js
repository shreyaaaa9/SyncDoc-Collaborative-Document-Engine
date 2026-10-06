const assert = require("assert");
const { sanitizeHtml } = require("./htmlSanitizer");
const { astToHtml } = require("./astToHtml");

console.log("===== DOMPURIFY SECURITY TEST =====");

// Direct malicious HTML test
const maliciousHtml = `
  <p>Hello</p>
  <script>alert("XSS")</script>
  <img src="x" onerror="alert('XSS')">
  <a href="javascript:alert('XSS')">Click</a>
`;

const sanitizedHtml = sanitizeHtml(maliciousHtml);

console.log("Sanitized HTML:");
console.log(sanitizedHtml);

assert(!sanitizedHtml.includes("<script"));
assert(!sanitizedHtml.includes("onerror"));
assert(!sanitizedHtml.includes("javascript:"));

console.log("DOMPurify malicious HTML test PASSED");

// AST-based malicious content test
const maliciousAST = {
  type: "root",
  children: [
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: '<script>alert("XSS")</script>'
        }
      ]
    }
  ]
};

const safeHtml = astToHtml(maliciousAST);

console.log("\nAST → Safe HTML:");
console.log(safeHtml);

assert(!safeHtml.includes("<script>"));
assert(safeHtml.includes("&lt;script&gt;"));

console.log("AST XSS protection test PASSED");

console.log("\nALL DOMPURIFY SECURITY TESTS PASSED");
