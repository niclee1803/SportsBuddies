# SportsBuddies Mobile App
  A mobile application built with React Native (Expo), TypeScript, Firebase, and Node.js, designed to help users find and connect with sports buddies based on shared interests and 
  availability!
## How to Run it Locally
Clone the project
```bash
git clone https://github.com/niclee1803/SportsBuddies.git
```

Run the backend and frontend servers on different terminals.

## How to run the backend server
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

4. Scan QR Code on mobile


## System Architecture
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
                          Model │  │Controller                       └────────────────────▲───┬────────────┘
                        Objects │  │  calls                                      responses│   │             
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
