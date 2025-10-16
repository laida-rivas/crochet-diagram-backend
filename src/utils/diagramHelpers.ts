import { Diagram, Stitch } from '../types/diagram';
import { v4 as uuidv4 } from 'uuid';

export function addStitch(
  diagram: Diagram,
  rowIndex: number,
  type: Stitch['type'],
  parentIndex?: number, // index of parent stitch (not used for chain-spaces)
  isTurningChain: boolean = false,
  includedAsStitch: boolean = false,
  chainSpaceLength: number = 0 // optional: number of chains in a chain-space
) {
  // --- Basic validations ---
  if (diagram.base === 'row') {
    if (type === 'magic_circle') {
      throw new Error('Magic circle cannot be added to a row diagram');
    }

    // Row 0 must start with a chain
    if (rowIndex === 0 && type !== 'chain') {
      throw new Error('Row 0 in a row diagram must start with a chain');
    }

    // Row 0 cannot start with a turning chain
    if (rowIndex === 0 && isTurningChain) {
      throw new Error('Cannot start row 0 with a turning chain');
    }
  }

  const rows = diagram.rowsOrRounds;
  if (!rows[rowIndex]) {
    rows[rowIndex] = [];
  }
  const row = rows[rowIndex];

  // --- Turning chain rules ---
  if (isTurningChain) {
    if (type !== 'chain') {
      throw new Error('Only chains can be turning chains');
    }
    if (rowIndex > 0 && row.length === 0) {
      // Only allow turning chains if previous row exists
      const prevRow = rows[rowIndex - 1];
      if (!prevRow || prevRow.length === 0) {
        throw new Error('Cannot place a turning chain without a previous row with stitches');
      }
    }
  } else if (row.length > 0 && row[row.length - 1].isTurningChain) {
    // Cannot place a normal chain immediately after a turning chain
    if (type === 'chain') {
      throw new Error('Cannot place a normal chain immediately after a turning chain');
    }
  }

  // --- Handle Chain-Spaces ---
  if (type === 'chain-space') {
    if (chainSpaceLength < 1 || chainSpaceLength > 5) {
      throw new Error('Chain-space must have between 1 and 5 chains');
    }

    // Store as an open chain-space (we'll finalize when the next non-chain stitch is added)
    diagram.openChainSpaces = diagram.openChainSpaces || [];
    diagram.openChainSpaces.push({
      rowIndex,
      startIndex: row.length, // first stitch of chain-space
      length: chainSpaceLength,
      startParents: parentIndex !== undefined ? [row[parentIndex]] : [],
    });

    // Add a placeholder stitch to row for now
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

  // --- Max children validation for parent ---
  let parent: Stitch | undefined;
  if (parentIndex !== undefined) {
    parent = row[parentIndex];
    if (!parent) throw new Error('Parent stitch does not exist');

    const childrenCount = parent.children?.length || 0;
    if (childrenCount >= 8) {
      throw new Error('Parent stitch cannot have more than 8 children');
    }
  }

  // --- Create new stitch ---
  const newStitch: Stitch = {
    id: uuidv4(),
    type,
    children: [],
    rowOffset: 0,
    isTurningChain,
    includedAsStitch,
  };

  // --- Attach to parent or row ---
  if (parent) {
    parent.children = parent.children || [];
    parent.children.push(newStitch);
  } else {
    row.push(newStitch);
  }

  // --- Finalize any open chain-spaces in this row ---
  if (diagram.openChainSpaces && diagram.openChainSpaces.length > 0) {
    const openSpaces = diagram.openChainSpaces.filter(cs => cs.rowIndex === rowIndex);
    openSpaces.forEach(cs => {
      // The new stitch is the end of the chain-space
      const chainSpaceStitch = row[cs.startIndex]; // placeholder stitch
      chainSpaceStitch.children = chainSpaceStitch.children || [];
      chainSpaceStitch.children.push(newStitch);
      // Add the skipped stitches as parents
      chainSpaceStitch['parents'] = cs.startParents.concat(row.slice(cs.startIndex + 1, row.length - 1));
    });
    // Remove finalized chain-spaces
    diagram.openChainSpaces = diagram.openChainSpaces.filter(cs => cs.rowIndex !== rowIndex);
  }
}
