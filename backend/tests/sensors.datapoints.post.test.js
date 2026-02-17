import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Sensor, DataPoint } from '../src/models/index.js';

describe('POST /api/sensors/:id/datapoints', () => {
  let sensor;

  beforeEach(async () => {
    sensor = await Sensor.create({
      alias: 'Temperature Sensor',
      type: 'float',
    });
  });

  it('WHEN posting a valid datapoint THEN returns 201 and the created datapoint', async () => {
    const response = await request(app)
      .post(`/api/sensors/${sensor.id}/datapoints`)
      .send({ value: 23.5 })
      .expect(201);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.datapoint).toBeDefined();
    expect(response.body.data.datapoint.value).toBe(23.5);
    expect(response.body.data.datapoint.sensorId).toBe(sensor.id);
  });

  it('WHEN posting a datapoint to non-existent sensor THEN returns 404', async () => {
    const response = await request(app)
      .post('/api/sensors/99999/datapoints')
      .send({ value: 23.5 })
      .expect(404);

    expect(response.body.error).toBeDefined();
  });

  it('WHEN posting a datapoint with invalid sensor ID THEN returns 400', async () => {
    const response = await request(app)
      .post('/api/sensors/invalid/datapoints')
      .send({ value: 23.5 })
      .expect(400);

    expect(response.body.error).toBeDefined();
  });

  it('WHEN posting a datapoint without value THEN returns 400', async () => {
    const response = await request(app)
      .post(`/api/sensors/${sensor.id}/datapoints`)
      .send({})
      .expect(400);

    expect(response.body.error).toBeDefined();
  });

  it('WHEN posting datapoints for different types THEN stores correctly', async () => {
    const intSensor = await Sensor.create({ alias: 'Int Sensor', type: 'int' });
    const boolSensor = await Sensor.create({ alias: 'Bool Sensor', type: 'boolean' });
    const strSensor = await Sensor.create({ alias: 'Str Sensor', type: 'string' });

    const intRes = await request(app)
      .post(`/api/sensors/${intSensor.id}/datapoints`)
      .send({ value: 42 })
      .expect(201);
    expect(intRes.body.data.datapoint.value).toBe(42);

    const boolRes = await request(app)
      .post(`/api/sensors/${boolSensor.id}/datapoints`)
      .send({ value: true })
      .expect(201);
    expect(boolRes.body.data.datapoint.value).toBe(true);

    const strRes = await request(app)
      .post(`/api/sensors/${strSensor.id}/datapoints`)
      .send({ value: "OK" })
      .expect(201);
    expect(strRes.body.data.datapoint.value).toBe("OK");
  });

  it('WHEN posting a datapoint THEN it persists in the database', async () => {
    await request(app)
      .post(`/api/sensors/${sensor.id}/datapoints`)
      .send({ value: 25.0 })
      .expect(201);

    const datapoints = await DataPoint.findAll({ where: { sensorId: sensor.id } });
    expect(datapoints).toHaveLength(1);
  });
});
