#Backend
```
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

# Frontend
```
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
```
