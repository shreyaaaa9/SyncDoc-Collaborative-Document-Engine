async function generateAST(markdown) {
  const { unified } = await import("unified");
  const { default: remarkParse } = await import("remark-parse");

  const tree = unified()
    .use(remarkParse)
    .parse(markdown);

  return tree;
}

module.exports = { generateAST };
