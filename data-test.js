import * as mqtt from 'mqtt';

const client = mqtt.connect('wss://nam1.cloud.thethings.network:8884/mqtt', {
  username: 'agrismart-ucr@ttn',
  password: 'NNSXS.L6V7WH7F4UPAAJ47HVHUEBSO3JDHDZW7PKDYSMA.4MYP6OBQ3MZVWQV56EI7YNRAFUZJ4CDF5ZVFQA67UEFO44ZMW4SQ'  // Click "Generate new API key" in console
});

client.on('connect', () => {
  console.log('Connected to TTN!');
  client.subscribe('v3/agrismart-ucr@ttn/devices/flujo-02-c7/up');
});

client.on('message', (topic, message) => {
  const data = JSON.parse(message.toString());
  console.log(data.uplink_message.decoded_payload); // your sensor values here
});