export interface Stitch {
  type: 
    | 'chain'
    | 'single'
    | 'half-double'
    | 'double'
    | 'treble'
    | 'slip'
    | 'skipped'
    | 'chain-space';
  children?: Stitch[];
  rowOffset?: number;
  isTurningChain?: boolean;
  includedAsStitch?: boolean;
}

export interface Diagram {
  id: number;
  title: string;
  base: 'row' | 'round';
  rowsOrRounds: Stitch[][];
}
