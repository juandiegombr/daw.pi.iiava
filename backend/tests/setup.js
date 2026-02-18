import { beforeAll, afterAll, afterEach } from 'vitest';
import { sequelize, Sensor, DataPoint, Alert, User } from '../src/models/index.js';

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterEach(async () => {
  await Alert.destroy({ where: {}, truncate: true });
  await DataPoint.destroy({ where: {}, truncate: true });
  await Sensor.destroy({ where: {}, truncate: true });
  await User.destroy({ where: {}, truncate: true });
});

afterAll(async () => {
  await sequelize.close();
});
