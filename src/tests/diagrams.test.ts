import request from 'supertest';
import express from 'express';
import diagramsRouter from '../routes/diagrams';

const app = express();
app.use(express.json());
app.use('/diagrams', diagramsRouter);

describe('Diagrams API', () => {
  it('should return an empty array on GET /diagrams', async () => {
    const res = await request(app).get('/diagrams');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should create a new diagram with POST /diagrams', async () => {
    const payload = {
      title: 'Test Diagram',
      base: 'chain',
      rowsOrRounds: []
    };
    const res = await request(app).post('/diagrams').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.title).toBe(payload.title);
  });

  it('should return 400 for invalid payload', async () => {
    const res = await request(app).post('/diagrams').send({});
    expect(res.status).toBe(400);
  });
});
