import mongoose from 'mongoose';
import config from '../config';

const mongoConnection = async () => {
  mongoose
    .connect(config.MONGO_URI || '')
    .then((_conn) => {
      console.log('Successfully connected to db');
      mongoose.set('debug', config.NODE_ENV == 'development');
    })
    .catch((err) => {
      console.log('Error Establishing a Database Connection, ' + err);
    });
};

export default mongoConnection;
