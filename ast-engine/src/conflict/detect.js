function getNodeContent(node) {
  if (!node) {
    return "";
  }

  if (node.type === "text") {
    return node.value || "";
  }

  if (Array.isArray(node.children)) {
    return node.children.map(getNodeContent).join(" ");
  }

  return "";
}

function getNodeSignature(node) {
  if (!node) {
    return "";
  }

  return `${node.type}:${getNodeContent(node)}`;
}

function findNodeByType(baseNode, nodes, usedIndexes) {
  const baseType = baseNode.type;

  for (let i = 0; i < nodes.length; i++) {
    if (usedIndexes.has(i)) {
      continue;
    }

    if (nodes[i].type === baseType) {
      return {
        node: nodes[i],
        index: i
      };
    }
  }

  return null;
}

function detectConflicts(baseAST, astA, astB) {
  const conflicts = [];

  const baseNodes = baseAST.children || [];
  const nodesA = astA.children || [];
  const nodesB = astB.children || [];

  const usedA = new Set();
  const usedB = new Set();

  for (let i = 0; i < baseNodes.length; i++) {
    const baseNode = baseNodes[i];
    const baseContent = getNodeContent(baseNode);

    const matchA = findNodeByType(baseNode, nodesA, usedA);
    const matchB = findNodeByType(baseNode, nodesB, usedB);

    const nodeA = matchA ? matchA.node : null;
    const nodeB = matchB ? matchB.node : null;

    if (matchA) {
      usedA.add(matchA.index);
    }

    if (matchB) {
      usedB.add(matchB.index);
    }

    const changedA =
      nodeA && getNodeContent(nodeA) !== baseContent;

    const changedB =
      nodeB && getNodeContent(nodeB) !== baseContent;

    const deletedA = !nodeA;
    const deletedB = !nodeB;

    // Both users modified the same section
    if (changedA && changedB) {
      conflicts.push({
        type: "conflict",
        reason: "Both users modified the same section",
        index: i
      });

      continue;
    }

    // One user deleted while the other edited
    if (
      (deletedA && changedB) ||
      (deletedB && changedA)
    ) {
      conflicts.push({
        type: "conflict",
        reason: "One user deleted a section while another edited it",
        index: i
      });
    }
  }

  return conflicts;
}

module.exports = { detectConflicts };
