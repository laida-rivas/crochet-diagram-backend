import { Diagram, Stitch } from '../types/diagram';
import { v4 as uuidv4 } from 'uuid';

export function addStitch(
  diagram: Diagram,
  rowIndex: number,
  type: Stitch['type'],
  parentIndex?: number,
  isTurningChain: boolean = false,
  includedAsStitch: boolean = false,
  chainSpaceLength: number = 0
) {
  const rows = diagram.rowsOrRounds;

  // --- 🔹 Round-based validations ---
  if (diagram.base === 'round') {
    const hasMagicCircle = rows.some(r => r.some(st => st.type === 'magic_circle'));

    // Round diagrams must start with a magic circle
    if (!hasMagicCircle && type !== 'magic_circle') {
      throw new Error('Round diagrams must start with a magic circle');
    }

    // Prevent multiple magic circles
    if (type === 'magic_circle' && hasMagicCircle) {
      throw new Error('Only one magic circle can be added to a round diagram');
    }

    // Turning chain behavior for rounds:
    // Turning chains are always added to the next round regardless of `includedAsStitch`
    if (isTurningChain && type === 'chain') {
      const nextRoundIndex = rowIndex + 1;
      if (!rows[nextRoundIndex]) rows[nextRoundIndex] = [];

      const turningChain: Stitch = {
        id: uuidv4(),
        type,
        children: [],
        rowOffset: 0,
        isTurningChain,
        includedAsStitch,
      };

      // Attach to last stitch of previous round if possible
      const prevRound = rows[rowIndex];
      if (prevRound && prevRound.length > 0) {
        const lastPrevStitch = prevRound[prevRound.length - 1];
        lastPrevStitch.children = lastPrevStitch.children || [];
        lastPrevStitch.children.push(turningChain);
      }

      rows[nextRoundIndex].push(turningChain);
      return;
    }
  }

  // --- 🔹 Row-based validations ---
  if (diagram.base === 'row') {
    if (type === 'magic_circle') {
      throw new Error('Magic circle cannot be added to a row diagram');
    }

    // Row 0 must start with a chain
    if (rowIndex === 0 && type !== 'chain') {
      throw new Error('Row 0 in a row diagram must start with a chain');
    }

    // Row 0 cannot start with a turning chain
    if (rowIndex === 0 && isTurningChain && (!rows[rowIndex] || rows[rowIndex].length === 0)) {
      throw new Error('Cannot start row 0 with a turning chain');
    }
  }

  if (!rows[rowIndex]) rows[rowIndex] = [];
  const row = rows[rowIndex];

  // --- 🔹 Special case: turning chain included as stitch (row diagrams only) ---
  if (diagram.base === 'row' && type === 'chain' && isTurningChain && includedAsStitch) {
    const prevRow = rows[rowIndex - 1];

    if (rowIndex > 0) {
      if (!prevRow || prevRow.length === 0) {
        throw new Error('Cannot place an included turning chain without a previous row');
      }

      const nextRowIndex = rowIndex + 1;
      if (!rows[nextRowIndex]) rows[nextRowIndex] = [];

      const lastPrevStitch = prevRow[prevRow.length - 1];
      const turningChain: Stitch = {
        id: uuidv4(),
        type,
        children: [],
        rowOffset: 0,
        isTurningChain,
        includedAsStitch,
      };

      lastPrevStitch.children = lastPrevStitch.children || [];
      lastPrevStitch.children.push(turningChain);
      rows[nextRowIndex].push(turningChain);
      return;
    } else {
      if (row.length === 0) {
        throw new Error('Cannot start a row with a turning chain unless row 0 has at least one chain');
      }

      const lastPrevStitch = row[row.length - 1];
      const turningChain: Stitch = {
        id: uuidv4(),
        type,
        children: [],
        rowOffset: 0,
        isTurningChain,
        includedAsStitch,
      };
      lastPrevStitch.children = lastPrevStitch.children || [];
      lastPrevStitch.children.push(turningChain);

      const nextRowIndex = rowIndex + 1;
      if (!rows[nextRowIndex]) rows[nextRowIndex] = [];
      rows[nextRowIndex].push(turningChain);
      return;
    }
  }

  // --- 🔹 Turning chain rules ---
  if (isTurningChain) {
    if (type !== 'chain') {
      throw new Error('Only chains can be turning chains');
    }
    if (diagram.base === 'row' && rowIndex > 0 && row.length === 0) {
      const prevRow = rows[rowIndex - 1];
      if (!prevRow || prevRow.length === 0) {
        throw new Error('Cannot place a turning chain without a previous row with stitches');
      }
    }
  } else if (row.length > 0 && row[row.length - 1].isTurningChain) {
    if (type === 'chain') {
      throw new Error('Cannot place a normal chain immediately after a turning chain');
    }
  }

  // --- 🔹 Handle Chain-Spaces ---
  if (type === 'chain-space') {
    if (chainSpaceLength < 1 || chainSpaceLength > 5) {
      throw new Error('Chain-space must have between 1 and 5 chains');
    }

    const hasValidPredecessor = row.some(
      (stitch) =>
        stitch.type !== 'chain' ||
        (stitch.isTurningChain && stitch.includedAsStitch)
    );

    if (!hasValidPredecessor) {
      throw new Error('Cannot place a chain-space before a non-chain stitch or included turning chain');
    }

    diagram.openChainSpaces = diagram.openChainSpaces || [];
    diagram.openChainSpaces.push({
      rowIndex,
      startIndex: row.length,
      length: chainSpaceLength,
      startParents: parentIndex !== undefined ? [row[parentIndex]] : [],
    });

    row.push({
      id: uuidv4(),
      type,
      children: [],
      rowOffset: 0,
      isTurningChain: false,
      includedAsStitch: false,
    });

    return;
  }

  if (row.length > 0) {
    const lastStitch = row[row.length - 1];
    if (lastStitch.type === 'chain-space' && type === 'chain') {
      throw new Error('Cannot add a chain stitch immediately after another chain=space stitch.');
    }
  }

  // --- 🔹 Max children validation for parent ---
  let parent;
  if (parentIndex !== undefined) {
    const parentRow = rowIndex > 0 ? rows[rowIndex - 1] : row;
    parent = parentRow[parentIndex];
    if (!parent) throw new Error('Parent stitch does not exist');

    const childrenCount = parent.children?.length || 0;
    if (childrenCount >= 8) throw new Error('Parent stitch cannot have more than 8 children');
  }

  // --- 🔹 Create new stitch ---
  const newStitch: Stitch = {
    id: uuidv4(),
    type,
    children: [],
    rowOffset: 0,
    isTurningChain,
    includedAsStitch,
  };

  // --- 🔹 Attach to parent or row ---
  if (parent) {
    parent.children = parent.children || [];
    parent.children.push(newStitch);
  } else {
    row.push(newStitch);
  }

  // --- 🔹 Finalize open chain-spaces ---
  if (diagram.openChainSpaces && diagram.openChainSpaces.length > 0 && newStitch.type !== 'chain-space') {
    const currentRowIndex = rowIndex;
    const openSpaces = diagram.openChainSpaces.filter(cs => cs.rowIndex === currentRowIndex);

    openSpaces.forEach(cs => {
      const chainSpaceStitch = row[cs.startIndex];
      chainSpaceStitch.children = chainSpaceStitch.children || [];
      chainSpaceStitch.children.push(newStitch);
    });

    diagram.openChainSpaces = diagram.openChainSpaces.filter(cs => cs.rowIndex !== currentRowIndex);
  }
}
