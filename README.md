# SportsBuddies Mobile App
  A mobile application built with React Native (Expo), TypeScript, Firebase, and Node.js, designed to help users find and connect with sports buddies based on shared interests and 
  availability!
## How to Run it Locally
Clone the project
```bash
git clone https://github.com/niclee1803/SportsBuddies.git
```
    
To get the environment variable files, contact us via email at trevsweproj@gmail.com
Add the `firebaseConfig.ts` file in `frontend/constants` directory
Add the `.env` file and `firebase_credentials.json` file to `backend` directory

Run the backend and frontend servers on different terminals.

### How to run the backend server
**Requirements:** Python 3.7 and above
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

3. Install the dependencies into your virtual environment
   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend development server
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

6. API endpoints will be hosted on port 8000 of your private IP address.


# Collaborating on the Repository
1. Clone the Repository
2. Navigate into the repository directory
3. Create a new branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. Edit the code using code editor of your choice
5. Stage your changes
   ```bash
   git add .
   ```
6. Commit your changes
   ```bash
   git commit -m "Your commit message"
   ```
7. Push your changes
   ```
   git push origin feature/your-feature-name
   ```
8. Create a pull request for your branch on Github website
9. Once approved, you can merge this pull request.


     
## How to run the frontend development server
**Requirements**: Expo Go app on your mobile, Node.js on PC
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

4. Scan the QR Code that appears on the terminal using your mobile phone camera.


## Simplified System Architecture
```text
      ┌─────────────────────────────────────────────────────────┐          Responses                        
      │                   FRONTEND LAYER                        ◄───────────────────────────┐               
      │  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐  │                           │               
      │  │ React Native  │  │ Expo Router  │  │ AsyncStorage │  ├────────────────────────┐  │               
      │  │ Components    │  │ Navigation   │  │ Local Cache  │  │        API requests    │  │               
      │  └───────────────┘  └──────────────┘  └──────────────┘  │                        │  │               
      └────────────────────────▲───┬────────────────────────────┘    ┌───────────────────▼──┴──────────────┐
                         JSON  │   │ HTTP Request                    │         EXTERNAL SERVICES           │
                       Response│   │ with AuthToken                  │ ┌─────────────┐ ┌────────────────┐  │
      ┌────────────────────────┴───▼────────────────────────────┐    │ │  SLA OneMap │ │ SportSG Sport  │  │
      │                   API GATEWAY                           │    │ │    API      │ │ Facilities API │  │
      │  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐  │    │ └─────────────┘ └────────────────┘  │
      │  │ FastAPI       │  │ Auth         │  │ API          │  │    │ ┌────────────┐  ┌──────────────┐    │
      │  │ Routes        │  │ Middleware   │  │ Validators   │  │    │ │  Firebase  │  │ Cloudinary   │    │
      │  └───────────────┘  └──────────────┘  └──────────────┘  │    │ │    Auth    │  │ Image Storage│    │
      └─────────────────────────▲──┬────────────────────────────┘    │ └────────────┘  └──────────────┘    │
                       Validated│  │Controller                       └────────────────────▲───┬────────────┘
                       Responses│  │  calls                                      Responses│   │             
 ┌──────────────────────────────┴──▼─────────────────────────────────────────────────┐    │   │             
 │                       SERVICE LAYER                                               │    │   │             
 │  ┌───────────────┐  ┌──────────────┐ ┌───────────┐ ┌──────────┐  ┌──────────────┐ │    │   │             
 │  │ Activity      │  │ User         │ │  Alert    │ │ Auth     │  │ Image Upload │ ├────┘   │API requests 
 │  │ Controller    │  │ Controller   │ │ Controller│ │ Service  │  │    Service   │ │        │             
 │  └───────────────┘  └──────────────┘ └───────────┘ └──────────┘  └──────────────┘ ◄────────┘             
 └──────────────────────────────▲──┬─────────────────────────────────────────────────┘                      
                          Model │  │Repository                                                              
                         Objects│  │Operations                                                              
      ┌─────────────────────────┴──▼──────────────────────────────────┐                                     
      │                DATA ACCESS LAYER                              │                                     
      │  ┌────────────┐  ┌────────────┐  ┌────────────┐ ┌──────────┐  │                                     
      │  │ Activity   │  │ User       │  │ Message    │ │ Alert    │  │                                     
      │  │ Repository │  │ Repository │  │ Repository │ │Repository│  │                                     
      │  └────────────┘  └────────────┘  └────────────┘ └──────────┘  │                                     
      └─────────────────────────▲──┬──────────────────────────────────┘                                     
                           Query│  │Database                                                                
                         Results│  │Queries                                                                 
                       ┌────────┴──▼───────────┐                                                            
                       │ PERSISTENT DATA LAYER │                                                            
                       │   ┌───────────┐       │                                                            
                       │   │ Firebase  │       │                                                            
                       │   │ Firestore │       │                                                            
                       │   │    DB     │       │                                                            
                       │   └───────────┘       │                                                            
                       └───────────────────────┘                                                                                       
```


# Application Skeleton
## Backend
```text
📁 backend
|-- 📁 activity
|   |-- 📁 controllers
|   |   |-- activity_controller.py
|   |-- 📁 models
|   |   |-- activity.py
|   |   |-- message.py
|   |-- 📁 repositories
|   |   |-- activity_repository.py
|   |   |-- message_repository.py
|   |-- schemas.py
|   |-- routes.py
|   |-- __init__.py
|
|-- 📁 user
|   |-- 📁 controllers
|   |   |-- user_controller.py
|   |-- 📁 models
|   |   |-- alert.py
|   |   |-- user.py
|   |-- 📁 repositories
|   |   |-- alert_repository.py
|   |   |-- user_repository.py
|   |-- schemas.py
|   |-- 📁 services
|   |   |-- alert_service.py
|   |   |-- auth_service.py
|   |   |-- image_service.py
|   |-- routes.py
|   |-- __init__.py
|
|-- 📁 utils
|   |-- firebase_admin.py
|   |-- routes.py
|
|-- main.py
|-- config.py
|-- requirements.txt
```

## Frontend
📁 frontend
|-- 📁 app
    |-- 📁 (auth)
        |-- _layout.tsx
        |-- ForgetPassword.tsx
        |-- Login.tsx
        |-- SignUp.tsx
        |-- index.tsx
    |-- 📁 (main)
        |-- _layout.tsx
        |-- Alerts.tsx
        |-- Create.tsx
        |-- Dashboard.tsx
        |-- Feed.tsx
        |-- Profile.tsx
        |-- ProfileSettings.tsx
        |-- SetPreferences.tsx
        |-- Settings.tsx
        |-- UserThreads.tsx
    |-- 📁 (activity)
        |-- ActivityDetail.tsx
        |-- ActivityThread.tsx
        |-- ManageActivity.tsx
        |-- ManageParticipants.tsx
    |-- _layout.tsx
    |-- index.tsx
|-- 📁 components
    |-- 📁 activity
        |-- ActivityCard.tsx
        |-- ActivityMenu.tsx
        |-- FilterModal.tsx
        |-- BannerPicker.tsx
        |-- DateTimeInput.tsx
        |-- LocationInput.tsx
    |-- 📁 alert
        |-- AlertCard.tsx
    |-- 📁 preferences
        |-- SportsSkillsMenu.tsx
    |-- AuthLayout.tsx
    |-- LoadingOverlay.tsx
|-- 📁 hooks
    |-- FacilityLocation.ts
    |-- ThemeContext.tsx
|-- 📁 services
    |-- AlertService.ts
|-- 📁 types
    |-- activity.ts
    |-- alert.ts
    |-- location.ts
    |-- user.ts
|-- 📁 utils
    |-- GetUser.ts
    |-- alertUtils.ts
    |-- validationUtils.ts
|-- config.json

# Demo Video



# External APIs and Datasets Used


# Contributors
