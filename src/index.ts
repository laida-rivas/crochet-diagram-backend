import express from 'express';
import diagramRoutes from './routes/diagrams';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/api/diagrams', diagramRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});