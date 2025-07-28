import firebase_admin
from firebase_admin import credentials

cred = credentials.Certificate("../api/static/naturaldisaster-47f45-firebase-adminsdk-fbsvc-c389f2c7a9.json")
firebase_admin.initialize_app(cred)
