# Database Seeding

This directory contains the database seeding functionality for the SprintSync application.

## Files

### `seed.json`
Contains the seed data in JSON format. This makes it easy to:
- Add/remove users without touching code
- Version control the seed data separately
- Share seed data between team members
- Modify data without recompiling

### `seedUsers.ts`
TypeScript file that handles the seeding logic:
- Loads data from `seed.json`
- Validates the data structure
- Hashes passwords securely
- Checks for existing users to avoid duplicates
- Provides detailed logging

### `initializeData.ts`
Legacy initialization file (kept for backward compatibility).

## Usage

### Running the Seed Script

```bash
# Using yarn
yarn seed:users

# Using npm
npm run seed:users

# Direct execution
node scripts/seed-users.js
```

### Adding New Users

To add new users, simply edit `seed.json`:

```json
{
  "users": [
    {
      "firstName": "New",
      "lastName": "User",
      "email": "new.user@company.com",
      "password": "password123",
      "isAdmin": false
    }
  ]
}
```

### Modifying Existing Users

Edit the user object in `seed.json`. Note that:
- Passwords will be re-hashed on each run
- Email addresses should remain unique
- The script will skip seeding if users already exist

### Seed Data Structure

```typescript
interface SeedUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin: boolean;
}
```

## Security Notes

- **Passwords**: All passwords are hashed using bcrypt with salt rounds of 10
- **Default Password**: All seeded users use `password123` - change this in production
- **Admin Users**: Only create admin users when necessary for development

## Future Enhancements

The seeding system can be extended to include:
- Task templates
- Project structures
- Default categories
- Sample time logs
- Team assignments

## Troubleshooting

### Common Issues

1. **File not found**: Ensure `seed.json` exists in the same directory as `seedUsers.ts`
2. **Invalid JSON**: Validate JSON syntax using a JSON validator
3. **Permission errors**: Check file read permissions
4. **Database connection**: Ensure MongoDB is running and accessible

### Logs

The seeding process provides detailed logging:
- Number of users loaded from file
- Password hashing progress
- Database insertion results
- Any errors encountered
