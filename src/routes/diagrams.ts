import { Router, Request, Response } from 'express';
import { Diagram, Stitch } from '../types/diagram';
import { addStitch } from '../utils/diagramHelpers';

const router = Router();

let diagrams: Diagram[] = [];

router.get('/', (req: Request, res: Response) => {
  res.status(200).json(diagrams);
});

// Add a new diagram
router.post('/addDiagram', (req: Request, res: Response) => {
  const { title, base, rowsOrRounds } = req.body;

  if (!title || !base || !rowsOrRounds || !Array.isArray(rowsOrRounds)) {
    return res.status(400).json({ error: 'Invalid diagram payload' });
  }
  if (base !== 'row' && base !== 'round') {
    return res.status(400).json({ error: 'Invalid base type. Must be "row" or "round".' });
  }

  const newDiagram: Diagram = {
    id: Date.now(),
    title,
    base, // 'row' or 'round'
    rowsOrRounds,
    openChainSpaces: [],
  };

  diagrams.push(newDiagram);
  return res.status(201).json(newDiagram);
});

// Add a stitch to a diagram
router.post('/addStitch', (req: Request, res: Response) => {
  try {
    const diagramId = Number(req.body.diagramId);
    const { rowIndex, type, parentIndices, isTurningChain, includedAsStitch } = req.body;

    const diagram = diagrams.find(d => d.id === diagramId);
    if (!diagram) {
      return res.status(404).json({ error: 'Diagram not found' });
    }

    // Call helper to add stitch with all validations
    addStitch(diagram, rowIndex, type, parentIndices, isTurningChain, includedAsStitch);

    return res.status(201).json(diagram);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
