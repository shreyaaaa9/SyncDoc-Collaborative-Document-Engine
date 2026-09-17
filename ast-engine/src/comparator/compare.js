function removePositions(node) {
  if (Array.isArray(node)) {
    return node.map(removePositions);
  }

  if (node && typeof node === "object") {
    const cleanedNode = {};

    for (const key of Object.keys(node)) {
      if (key !== "position") {
        cleanedNode[key] = removePositions(node[key]);
      }
    }

    return cleanedNode;
  }

  return node;
}

function compareAST(astA, astB) {
  const changes = [];

  const nodesA = astA.children || [];
  const nodesB = astB.children || [];

  const maxLength = Math.max(nodesA.length, nodesB.length);

  for (let i = 0; i < maxLength; i++) {
    const nodeA = nodesA[i];
    const nodeB = nodesB[i];

    // Node was added
    if (!nodeA && nodeB) {
      changes.push({
        type: "added",
        index: i,
        node: nodeB
      });
      continue;
    }

    // Node was deleted
    if (nodeA && !nodeB) {
      changes.push({
        type: "deleted",
        index: i,
        node: nodeA
      });
      continue;
    }

    const cleanA = removePositions(nodeA);
    const cleanB = removePositions(nodeB);

    if (JSON.stringify(cleanA) !== JSON.stringify(cleanB)) {
      changes.push({
        type: "modified",
        index: i,
        before: nodeA,
        after: nodeB
      });
    }
  }

  return changes;
}

module.exports = { compareAST };