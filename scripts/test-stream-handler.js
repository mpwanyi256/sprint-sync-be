const axios = require('axios');

async function testStreamHandler() {
  try {
    console.log('Testing StreamHandler utility...');
    
    // Test the AI suggest endpoint with streaming
    console.log('\n1. Testing AI suggest endpoint with streaming...');
    
    const response = await axios.post('http://localhost:3000/ai/suggest', {
      title: 'Implement User Authentication'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'your-api-key-here'
      },
      responseType: 'stream'
    });

    console.log('Streaming response received:');
    console.log('Content-Type:', response.headers['content-type']);
    console.log('Transfer-Encoding:', response.headers['transfer-encoding']);
    
    let accumulatedContent = '';
    
    response.data.on('data', (chunk) => {
      const chunkStr = chunk.toString();
      accumulatedContent += chunkStr;
      process.stdout.write(chunkStr);
    });

    response.data.on('end', () => {
      console.log('\n\nStream completed');
      console.log('Total accumulated content length:', accumulatedContent.length);
    });

    response.data.on('error', (error) => {
      console.error('Stream error:', error);
    });

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Example of how to use StreamHandler on the client side
async function demonstrateClientUsage() {
  console.log('\n\n2. Demonstrating client-side StreamHandler usage...');
  
  try {
    const response = await fetch('http://localhost:3000/ai/suggest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'your-api-key-here'
      },
      body: JSON.stringify({
        title: 'Create Database Schema'
      })
    });

    if (response.ok) {
      // This would be used in a browser environment
      console.log('Response received, would use StreamHandler.handleClientStream() here');
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    }
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
}

testStreamHandler();
// demonstrateClientUsage(); // Uncomment when testing in browser environment
