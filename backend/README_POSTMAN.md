# How to Test TrustAI Backend with Postman

This guide will help you test the backend API using Postman.

## 1. Import Collection
1. Open **Postman**.
2. Click **Import** (top left).
3. Drag and drop the `backend_postman_collection.json` file (provided in artifacts).

## 2. Setup (Automatic)
The collection is configured to use:
- `{{baseUrl}}`: Defaults to `http://localhost:8000`
- `{{token}}`: Automatically set after logging in.
- `{{projectId}}`: Automatically set after creating a project.

## 3. Testing Flow
Follow this order to ensure variables are set correctly:

### Step 1: Authentication
1. Go to **Auth > Sign Up** -> Send (Create a user)
2. Go to **Auth > Login** -> Send (Logs in and saves the `token` variable automatically)
3. Go to **Auth > Get Me** -> Send (Verifies you are authenticated)

### Step 2: Projects
1. Go to **Projects > Create Project** -> Send (Creates a project and saves the `projectId` variable automatically)
2. Go to **Projects > Get All Projects** -> Send (Should list your project)
3. Go to **Projects > Add Note** -> Send (Adds a note to the current project)

### Step 3: Other Features
Once you have `{{token}}` and `{{projectId}}` set (by running Login and Create Project), you can test:
- **Messages**: Create messages in the project.
- **AI**: Analyze text (linked to the project).
- **Files**: Upload files (you will need to manually select a file in Postman's "Body" tab).

## Notes
- If you restart the backend, your `token` might expire or be invalid if the database didn't persist (depends on DB setup). Just login again.
- If you want to switch users, run **Sign Up** (with new email) and **Login**.
