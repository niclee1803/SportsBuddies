# Get started
Clone the project
```bash
git clone https://github.com/niclee1803/SportsBuddies.git
```

Run the backend and frontend servers on different terminals.

## How to run the backend server
1. Navigate to backend directory
   ```bash
   cd SportsBuddies/backend
   ```

2. If you havent already, create a virtual environment.
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment  
   **For Windows**
   ```bash
   venv\Scripts\activate
   ```
   or
   ```bash
   venv\bin\activate
   ```
   **For Mac**
   ```bash
   source venv\scripts\activate
   ```
   

   If you get an error about not running scripts in the system being disabled, you can enable it for the current terminal process
   ```bash
   Set-ExecutionPolicy Unrestricted -Scope Process
   ```

3. If you haven't already, install the dependencies
   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend development server
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

6. API endpoints will be hosted on port 8000 of your IP address.


## How to run the frontend development server
Requirements: Expo Go app on your mobile, Node.js on PC
1. Navigate to frontend directory
   ```bash
   cd SportsBuddies/frontend
   ```

2. Install required node modules
   ```
   npm install
   ```
   
3. Start development server with backend API calls directed to your IP address
   ```bash
   npm start
   ```

4. Scan QR Code on mobile


## Github Procedure for Cloning and Updating 
1. Clone the Main Repository to your Desktop 
2. git checkout -b feature/feature-name (Write this line of code in your terminal to create a new branch with the title feature/feature-name and switch to it automatically)
3. Can either open VsCode using code . in terminal, or just do it your way, make sure at the bottom left corner of VsCode, you are in the branch you created, or whatever IDE your using find a way to check the branch 
4. Make your changes to whatever section 
5. Commit your changes using git add . and git commit -m "Your message here"
6. If you are updating the local branch and want to sync the local branch to the main repo in case the main repo has been updated while you are working on the local branch, you can do git checkout - which should bring you to the local master branch. From there you can see if the local master branch is up to date with the main repo branch. If it is not, you can do git pull origin master to update the local master branch. Then you can do git checkout feature/feature-name to go back to your local branch and do git merge master to merge the changes from the local master branch to your local branch.
7. Push your changes to the main repo using git push origin feature/feature-name
8. Go to the main repo on Github and create a pull request from your branch to the main branch
9. Wait for the pull request to be reviewed and approved
10. Once approved, you can merge the pull request
11. Delete the branch you created using git branch -d feature/feature-name
