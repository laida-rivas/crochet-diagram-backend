import request from 'supertest';
import express from 'express';
import diagramsRouter from '../routes/diagrams';

const app = express();
app.use(express.json());
app.use('/api/diagrams', diagramsRouter);

describe('Diagrams API', () => {
  it('should return an empty array on GET /api/diagrams', async () => {
    const res = await request(app).get('/api/diagrams');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should create a new diagram with POST /api/diagrams/addDiagram', async () => {
    const payload = {
      title: 'Test Diagram',
      base: 'row',
      rowsOrRounds: []
    };

    const res = await request(app)
      .post('/api/diagrams/addDiagram')
      .send(payload)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe(payload.title);
    expect(res.body.base).toBe(payload.base);
    expect(res.body.rowsOrRounds).toEqual([]);
  });

  it('should return 400 for invalid payload', async () => {
    const res = await request(app)
      .post('/api/diagrams/addDiagram')
      .send({})
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 for invalid base type', async () => {
    const payload = {
      title: 'Invalid Base',
      base: 'chain',
      rowsOrRounds: []
    };

    const res = await request(app)
      .post('/api/diagrams/addDiagram')
      .send(payload)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
