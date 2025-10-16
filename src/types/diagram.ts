export interface Stitch {
  id: string;  // change to string for UUID
  type: 
    | 'chain'
    | 'single'
    | 'half-double'
    | 'double'
    | 'treble'
    | 'slip'
    | 'skipped'
    | 'chain-space'
    | 'magic_circle';
  children?: Stitch[];
  parents?: Stitch[];
  rowOffset?: number;
  isTurningChain?: boolean;
  includedAsStitch?: boolean;
  length?: number; // only for chain-space
}




export interface Diagram {
  id: number;
  title: string;
  base: 'row' | 'round';
  rowsOrRounds: Stitch[][];
  openChainSpaces?: { rowIndex: number; startIndex: number; length: number; startParents: Stitch[] }[];
}
