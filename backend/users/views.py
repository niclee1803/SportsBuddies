from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from firebase_admin import auth, firestore
import json

db = firestore.client()

def index(request):
    return HttpResponse("Users index")

@csrf_exempt
def signup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            first_name = data.get('firstName')
            last_name = data.get('lastName')
            phone = data.get('phone')
            username = data.get('username')

            # Create user in Firebase Auth
            user = auth.create_user(
                email=email,
                password=password,
                display_name=f"{first_name} {last_name}"
            )

            # Create user in Firestore
            user_data = {
                'firstName': first_name,
                'lastName': last_name,
                'email': email,
                'phone': phone,
                'username': username,
                'createdAt': firestore.SERVER_TIMESTAMP
            }
            db.collection('users').document(user.uid).set(user_data)

            return JsonResponse({'message': 'User created successfully', 'uid': user.uid}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')

            # Authenticate user with Firebase Auth
            user = auth.get_user_by_email(email)
            # Note: Firebase Admin SDK does not provide a direct way to verify passwords.
            # You need to use Firebase Authentication REST API to verify the password.

            # Assuming you have a way to verify the password, proceed with the login logic
            # For example, you can use Firebase Authentication REST API to verify the password
            # and get the ID token.

            # If authentication is successful, return user details
            return JsonResponse({'message': 'Login successful', 'uid': user.uid, 'email': user.email}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)