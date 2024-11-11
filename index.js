const express = require('express');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');

// Initialize DynamoDB DocumentClient
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'Users'; // Replace with your DynamoDB table name

// Initialize Express app
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route to create a new user
app.post('/create', async (req, res) => {
  const { userId, name, email } = req.body;

  if (!userId || !name || !email) {
    return res.status(400).json({ message: 'userId, name, and email are required' });
  }

  const params = {
    TableName: TABLE_NAME,
    Item: { userId, name, email }
  };

  try {
    await dynamoDb.put(params).promise();
    return res.status(201).json({
      message: 'User created successfully',
      user: { userId, name, email }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Internal Server Error', error });
  }
});

// Route to get a user by userId
app.get('/get/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  const params = {
    TableName: TABLE_NAME,
    Key: { userId }
  };

  try {
    const result = await dynamoDb.get(params).promise();
    if (!result.Item) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ user: result.Item });
  } catch (error) {
    console.error('Error getting user:', error);
    return res.status(500).json({ message: 'Internal Server Error', error });
  }
});

// Route to update user details
app.put('/update', async (req, res) => {
  const { userId, name, email } = req.body;

  if (!userId || !name || !email) {
    return res.status(400).json({ message: 'userId, name, and email are required' });
  }

  const params = {
    TableName: TABLE_NAME,
    Key: { userId },
    UpdateExpression: 'set #name = :name, #email = :email',
    ExpressionAttributeNames: {
      '#name': 'name',
      '#email': 'email'
    },
    ExpressionAttributeValues: {
      ':name': name,
      ':email': email
    },
    ReturnValues: 'ALL_NEW'
  };

  try {
    const result = await dynamoDb.update(params).promise();
    return res.status(200).json({
      message: 'User details updated successfully',
      updatedUser: result.Attributes
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Internal Server Error', error });
  }
});

// Route to delete a user by userId
app.delete('/delete/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  const params = {
    TableName: TABLE_NAME,
    Key: { userId }
  };

  try {
    await dynamoDb.delete(params).promise();
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Internal Server Error', error });
  }
});
app.get("/",async(req,res)=>{
    res.send("server running");
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
module.exports = app;
