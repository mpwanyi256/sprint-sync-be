// MongoDB initialization script for Docker container
db = db.getSiblingDB('sprint-sync');

db.createUser({
  user: 'sprintsync',
  pwd: 'sprintsync123',
  roles: [
    {
      role: 'dbOwner',
      db: 'sprint-sync',
    },
  ],
});

print('MongoDB user created successfully');
