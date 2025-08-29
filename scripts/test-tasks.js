const axios = require('axios');

async function testTaskEndpoints() {
  try {
    console.log('Testing Task endpoints...');
    
    // Test getting tasks with assignee information
    console.log('\n1. Testing GET /tasks endpoint...');
    const getTasksResponse = await axios.get('http://localhost:3000/tasks?page=1&limit=5', {
      headers: {
        'x-api-key': 'your-api-key-here',
        'Authorization': 'Bearer your-jwt-token-here'
      }
    });
    
    console.log('Tasks response:', JSON.stringify(getTasksResponse.data, null, 2));
    
    // Test updating a task
    if (getTasksResponse.data.data.tasks.length > 0) {
      const firstTask = getTasksResponse.data.data.tasks[0];
      console.log(`\n2. Testing PATCH /tasks/${firstTask.id} endpoint...`);
      
      const updateResponse = await axios.patch(`http://localhost:3000/tasks/${firstTask.id}`, {
        title: 'Updated Task Title',
        description: 'Updated task description'
      }, {
        headers: {
          'x-api-key': 'your-api-key-here',
          'Authorization': 'Bearer your-jwt-token-here'
        }
      });
      
      console.log('Update response:', JSON.stringify(updateResponse.data, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testTaskEndpoints();
