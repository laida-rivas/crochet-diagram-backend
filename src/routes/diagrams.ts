import { Router, Request, Response } from 'express';
import { Diagram, Stitch } from '../types/diagram';

const router = Router();

let diagrams: Diagram[] = [];

router.get('/', (req: Request, res: Response) => {
  res.status(200).json(diagrams);
});

router.post('/', (req, res) => {
  const { title, base, rowsOrRounds } = req.body;

  if (!title || !base || !rowsOrRounds || !Array.isArray(rowsOrRounds)) {
    return res.status(400).json({ error: 'Invalid diagram payload' });
  }

  const newDiagram: Diagram = {
    id: Date.now(),
    title,
    base,
    rowsOrRounds
  };

  diagrams.push(newDiagram);
  return res.status(201).json(newDiagram);
});


export default router;
