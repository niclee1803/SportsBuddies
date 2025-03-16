from google.cloud import firestore

db = None

def init_firestore():
    global db
    db = firestore.Client()