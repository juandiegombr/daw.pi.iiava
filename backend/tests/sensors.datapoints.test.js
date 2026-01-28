import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Sensor, DataPoint } from '../src/models/index.js';

describe('GET /api/sensors/:id/datapoints', () => {
  let sensorId;

  beforeEach(async () => {
    const sensor = await Sensor.create({
      alias: 'Temperature Sensor',
      type: 'float',
    });
    sensorId = sensor.id.toString();
  });

  it('WHEN getting datapoints for sensor with data THEN returns 200 and datapoints array', async () => {
    // Create some datapoints for the sensor
    await DataPoint.bulkCreate([
      { sensorId, valueFloat: 23.5, timestamp: new Date('2024-01-01T10:00:00Z') },
      { sensorId, valueFloat: 24.1, timestamp: new Date('2024-01-01T10:05:00Z') },
      { sensorId, valueFloat: 23.8, timestamp: new Date('2024-01-01T10:10:00Z') },
    ]);

    const response = await request(app)
      .get(`/api/sensors/${sensorId}/datapoints`)
      .expect(200);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.datapoints).toBeDefined();
    expect(Array.isArray(response.body.data.datapoints)).toBe(true);
    expect(response.body.data.datapoints).toHaveLength(3);

    // Verify datapoint structure
    const datapoint = response.body.data.datapoints[0];
    expect(datapoint).toHaveProperty('value');
    expect(datapoint).toHaveProperty('timestamp');
    expect(datapoint).toHaveProperty('sensorId');
  });

  it('WHEN getting datapoints for sensor without data THEN returns 200 and empty array', async () => {
    const response = await request(app)
      .get(`/api/sensors/${sensorId}/datapoints`)
      .expect(200);

    expect(response.body.data.datapoints).toBeDefined();
    expect(Array.isArray(response.body.data.datapoints)).toBe(true);
    expect(response.body.data.datapoints).toHaveLength(0);
  });

  it('WHEN getting datapoints with invalid sensor ID THEN returns 400', async () => {
    const response = await request(app)
      .get('/api/sensors/invalid-id/datapoints')
      .expect(400);

    expect(response.body.error).toBeDefined();
  });

  it('WHEN getting datapoints for non-existent sensor THEN returns 404', async () => {
    const nonExistentId = 99999;
    const response = await request(app)
      .get(`/api/sensors/${nonExistentId}/datapoints`)
      .expect(404);

    expect(response.body.error).toBeDefined();
  });

  it('WHEN getting datapoints THEN returns sorted by timestamp descending', async () => {
    // Create datapoints with different timestamps
    await DataPoint.bulkCreate([
      { sensorId, valueFloat: 20.0, timestamp: new Date('2024-01-01T10:00:00Z') },
      { sensorId, valueFloat: 25.0, timestamp: new Date('2024-01-01T12:00:00Z') },
      { sensorId, valueFloat: 22.5, timestamp: new Date('2024-01-01T11:00:00Z') },
    ]);

    const response = await request(app)
      .get(`/api/sensors/${sensorId}/datapoints`)
      .expect(200);

    const datapoints = response.body.data.datapoints;
    expect(datapoints).toHaveLength(3);

    // Should be sorted newest first
    expect(new Date(datapoints[0].timestamp).getTime()).toBeGreaterThan(
      new Date(datapoints[1].timestamp).getTime()
    );
    expect(new Date(datapoints[1].timestamp).getTime()).toBeGreaterThan(
      new Date(datapoints[2].timestamp).getTime()
    );
  });

  it('WHEN getting datapoints for different sensors THEN only returns datapoints for requested sensor', async () => {
    // Create another sensor
    const sensor2 = await Sensor.create({
      alias: 'Pressure Sensor',
      type: 'int',
    });

    // Create datapoints for both sensors
    await DataPoint.bulkCreate([
      { sensorId, valueFloat: 23.5 },
      { sensorId, valueFloat: 24.1 },
      { sensorId: sensor2.id, valueInt: 100 },
      { sensorId: sensor2.id, valueInt: 105 },
    ]);

    const response = await request(app)
      .get(`/api/sensors/${sensorId}/datapoints`)
      .expect(200);

    expect(response.body.data.datapoints).toHaveLength(2);

    // All datapoints should belong to the requested sensor
    response.body.data.datapoints.forEach(dp => {
      expect(dp.sensorId.toString()).toBe(sensorId);
    });
  });

  it('WHEN getting datapoints THEN includes sensor metadata', async () => {
    await DataPoint.create({
      sensorId,
      valueFloat: 23.5,
    });

    const response = await request(app)
      .get(`/api/sensors/${sensorId}/datapoints`)
      .expect(200);

    expect(response.body.data.sensor).toBeDefined();
    expect(response.body.data.sensor._id.toString()).toBe(sensorId);
    expect(response.body.data.sensor.alias).toBe('Temperature Sensor');
    expect(response.body.data.sensor.type).toBe('float');
  });
});
