import { beforeAll, afterAll, afterEach } from 'vitest';
import { sequelize, Sensor, DataPoint } from '../src/models/index.js';

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterEach(async () => {
  await DataPoint.destroy({ where: {}, truncate: true });
  await Sensor.destroy({ where: {}, truncate: true });
});

afterAll(async () => {
  await sequelize.close();
});
