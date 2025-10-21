import { addStitch } from '../utils/diagramHelpers';
import { Diagram } from '../types/diagram';

let diagram: Diagram;

beforeEach(() => {
  diagram = {
    id: 1,
    title: 'Test Diagram',
    base: 'row',
    rowsOrRounds: [[]],
  };
});

describe('addStitch function — Row-based Diagram', () => {
  it('should add a chain to an empty row 0', () => {
    addStitch(diagram, 0, 'chain', undefined, false, false);
    expect(diagram.rowsOrRounds[0][0].type).toBe('chain');
  });

  it('should throw an error if trying to add a turning chain in row 0 without a starting chain', () => {
    expect(() => {
      addStitch(diagram, 0, 'chain', undefined, true, false);
    }).toThrow('Cannot start row 0 with a turning chain');
  });

  it('should add a turning chain in row 0 if a chain exists and includedAsStitch is false', () => {
    addStitch(diagram, 0, 'chain');
    addStitch(diagram, 0, 'chain', undefined, true, false);
    expect(diagram.rowsOrRounds[0][1].isTurningChain).toBe(true);
  });

  it('should add a turning chain in row 1 as stitch if row 0 has a chain and includedAsStitch is true', () => {
    addStitch(diagram, 0, 'chain');
    addStitch(diagram, 0, 'chain', 0, true, true);
    expect(diagram.rowsOrRounds[1][0].isTurningChain).toBe(true);
  });

  it('should prevent a normal chain immediately after a turning chain', () => {
    addStitch(diagram, 0, 'chain');
    addStitch(diagram, 0, 'chain', undefined, true, false);
    expect(() => {
      addStitch(diagram, 0, 'chain');
    }).toThrow('Cannot place a normal chain immediately after a turning chain');
  });

  it('should throw an error if adding a magic circle in a row diagram', () => {
    expect(() => addStitch(diagram, 0, 'magic_circle')).toThrow(
      'Magic circle cannot be added to a row diagram'
    );
  });

  it('should add a stitch as a child of a parent stitch', () => {
    addStitch(diagram, 0, 'chain');
    addStitch(diagram, 1, 'single', 0);
    const parent = diagram.rowsOrRounds[0][0];
    expect(parent.children!.length).toBe(1);
    expect(parent.children![0].type).toBe('single');
  });

  it('should throw if parent stitch does not exist', () => {
    addStitch(diagram, 0, 'chain');
    expect(() => {
      addStitch(diagram, 1, 'single', 5); // invalid parent index
    }).toThrow('Parent stitch does not exist');
  });

  it('should throw if a parent already has 8 children', () => {
    addStitch(diagram, 0, 'chain');
    for (let i = 0; i < 8; i++) {
      addStitch(diagram, 1, 'single', 0);
    }
    expect(() => {
      addStitch(diagram, 1, 'single', 0);
    }).toThrow('Parent stitch cannot have more than 8 children');
  });

  it('should throw if starting a chain-space without parent or included turning chain', () => {
    addStitch(diagram, 0, 'chain');
    expect(() => {
      addStitch(diagram, 1, 'chain-space', undefined, false, false, 3);
    }).toThrow(
      'Cannot place a chain-space before a non-chain stitch or included turning chain'
    );
  });

  it('should add a valid chain-space and link correctly', () => {
    addStitch(diagram, 0, 'chain');
    addStitch(diagram, 0, 'chain', 0, true, true);
    addStitch(diagram, 1, 'chain-space', undefined, false, false, 3);
    addStitch(diagram, 1, 'single', 0);
    const chainSpace = diagram.rowsOrRounds[1][1];
    expect(chainSpace.type).toBe('chain-space');
  });

  it('should throw if chain-space length exceeds 5', () => {
    addStitch(diagram, 0, 'chain');
    addStitch(diagram, 0, 'chain', 0, true, true);
    expect(() => {
      addStitch(diagram, 1, 'chain-space', undefined, false, false, 6);
    }).toThrow('Chain-space must have between 1 and 5 chains');
  });
});

describe('addStitch function — Round-based Diagram', () => {
  beforeEach(() => {
    diagram = {
      id: 2,
      title: 'Round Diagram',
      base: 'round',
      rowsOrRounds: [[]],
    };
  });

  it('should start with a magic circle', () => {
    addStitch(diagram, 0, 'magic_circle');
    expect(diagram.rowsOrRounds[0][0].type).toBe('magic_circle');
  });

  it('should throw if adding another magic circle after one exists', () => {
    addStitch(diagram, 0, 'magic_circle');
    expect(() => {
      addStitch(diagram, 1, 'magic_circle');
    }).toThrow('Only one magic circle can be added to a round diagram');
  });

  it('should throw if first stitch is not magic circle', () => {
    expect(() => addStitch(diagram, 0, 'chain')).toThrow(
      'Round diagrams must start with a magic circle'
    );
  });

  it('should allow turning chain immediately after magic circle', () => {
    addStitch(diagram, 0, 'magic_circle');
    addStitch(diagram, 0, 'chain', undefined, true, false);
    expect(diagram.rowsOrRounds[1][0].isTurningChain).toBe(true);
  });

  it('should always place turning chain in the next round (even if not includedAsStitch)', () => {
    addStitch(diagram, 0, 'magic_circle');
    addStitch(diagram, 0, 'chain', undefined, true, false);
    const nextRound = diagram.rowsOrRounds[1];
    expect(nextRound.length).toBe(1);
    expect(nextRound[0].isTurningChain).toBe(true);
  });
});
