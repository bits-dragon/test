// model.js
import mdns from 'multicast-dns';

const mdnsInstance = mdns();

mdnsInstance.on('response', (res) => {
  console.log(res.answers);
});

mdnsInstance.query({
  questions: [{ name: '7ed326ec-0f0a-4efe-984d-94074984e35e.local', type: 'A' }]
});
