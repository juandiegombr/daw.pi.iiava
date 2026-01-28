import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Sensor } from '../src/models/index.js';

describe('PUT /api/sensors/:id', () => {
  let sensorId;

  beforeEach(async () => {
    const sensor = await Sensor.create({
      alias: 'Temperature Sensor',
      type: 'float',
    });
    sensorId = sensor.id.toString();
  });

  it('WHEN updating existing sensor with valid data THEN returns 200 and updated sensor', async () => {
    const updateData = {
      alias: 'Updated Temperature Sensor',
      type: 'int',
    };

    const response = await request(app)
      .put(`/api/sensors/${sensorId}`)
      .send(updateData)
      .expect(200);

    expect(response.body.data.sensor).toBeDefined();
    expect(response.body.data.sensor.alias).toBe('Updated Temperature Sensor');
    expect(response.body.data.sensor.type).toBe('int');
    expect(response.body.data.sensor._id.toString()).toBe(sensorId);

    const updatedSensor = await Sensor.findByPk(sensorId);
    expect(updatedSensor.alias).toBe('Updated Temperature Sensor');
    expect(updatedSensor.type).toBe('int');
  });

  it('WHEN updating only alias THEN returns 200 and updates only alias', async () => {
    const updateData = {
      alias: 'New Alias',
    };

    const response = await request(app)
      .put(`/api/sensors/${sensorId}`)
      .send(updateData)
      .expect(200);

    expect(response.body.data.sensor.alias).toBe('New Alias');
    expect(response.body.data.sensor.type).toBe('float');
  });

  it('WHEN updating only type THEN returns 200 and updates only type', async () => {
    const updateData = {
      type: 'boolean',
    };

    const response = await request(app)
      .put(`/api/sensors/${sensorId}`)
      .send(updateData)
      .expect(200);

    expect(response.body.data.sensor.alias).toBe('Temperature Sensor');
    expect(response.body.data.sensor.type).toBe('boolean');
  });

  it('WHEN updating with invalid type THEN returns 400', async () => {
    const updateData = {
      type: 'invalid_type',
    };

    const response = await request(app)
      .put(`/api/sensors/${sensorId}`)
      .send(updateData)
      .expect(400);

    expect(response.body.error).toBeDefined();
  });

  it('WHEN updating non-existent sensor THEN returns 404', async () => {
    const nonExistentId = 99999;
    const updateData = {
      alias: 'New Alias',
    };

    const response = await request(app)
      .put(`/api/sensors/${nonExistentId}`)
      .send(updateData)
      .expect(404);

    expect(response.body.error).toBeDefined();
  });

  it('WHEN updating with invalid ID THEN returns 400', async () => {
    const updateData = {
      alias: 'New Alias',
    };

    const response = await request(app)
      .put('/api/sensors/invalid-id')
      .send(updateData)
      .expect(400);

    expect(response.body.error).toBeDefined();
  });

  it('WHEN updating with empty data THEN returns 400', async () => {
    const response = await request(app)
      .put(`/api/sensors/${sensorId}`)
      .send({})
      .expect(400);

    expect(response.body.error).toBeDefined();
  });

  it('WHEN sensor is updated THEN updatedAt timestamp changes', async () => {
    const originalSensor = await Sensor.findByPk(sensorId);
    const originalUpdatedAt = originalSensor.updatedAt;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateData = {
      alias: 'Updated Sensor',
    };

    await request(app)
      .put(`/api/sensors/${sensorId}`)
      .send(updateData)
      .expect(200);

    const updatedSensor = await Sensor.findByPk(sensorId);
    expect(updatedSensor.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });
});
