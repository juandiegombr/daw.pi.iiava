import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Sensor } from '../src/models/index.js';

describe('DELETE /api/sensors/:id', () => {
  let sensorId;

  beforeEach(async () => {
    const sensor = await Sensor.create({
      alias: 'Temperature Sensor',
      type: 'float',
    });
    sensorId = sensor.id.toString();
  });

  it('WHEN deleting existing sensor THEN returns 200 and removes sensor', async () => {
    const response = await request(app)
      .delete(`/api/sensors/${sensorId}`)
      .expect(200);

    expect(response.body.success).toBe(true);

    const deletedSensor = await Sensor.findByPk(sensorId);
    expect(deletedSensor).toBeNull();
  });

  it('WHEN deleting non-existent sensor THEN returns 404', async () => {
    const nonExistentId = 99999;
    const response = await request(app)
      .delete(`/api/sensors/${nonExistentId}`)
      .expect(404);

    expect(response.body.error).toBeDefined();
  });

  it('WHEN deleting with invalid ID THEN returns 400', async () => {
    const response = await request(app)
      .delete('/api/sensors/invalid-id')
      .expect(400);

    expect(response.body.error).toBeDefined();
  });

  it('WHEN sensor is deleted THEN other sensors remain', async () => {
    const sensor2 = await Sensor.create({
      alias: 'Pressure Sensor',
      type: 'int',
    });

    await request(app)
      .delete(`/api/sensors/${sensorId}`)
      .expect(200);

    const remainingSensor = await Sensor.findByPk(sensor2.id);
    expect(remainingSensor).not.toBeNull();
    expect(remainingSensor.alias).toBe('Pressure Sensor');
  });
});
