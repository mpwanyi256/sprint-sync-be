const axios = require('axios');

async function testAISuggest() {
  try {
    console.log('Testing AI suggest endpoint...');
    
    const response = await axios.post('http://localhost:3000/ai/suggest', {
      title: 'Implement Authentication'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'your-api-key-here'
      },
      responseType: 'stream'
    });

    console.log('Response received:');
    response.data.on('data', (chunk) => {
      process.stdout.write(chunk.toString());
    });

    response.data.on('end', () => {
      console.log('\n\nStream completed');
    });

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAISuggest();
