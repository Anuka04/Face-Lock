from flask import Flask, jsonify, request
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
from dotenv import load_dotenv
from flask_mail import Mail, Message
import pyotp
import os

load_dotenv()

app = Flask(__name__)

mail = Mail(app)

app.config["MAIL_SERVER"] = 'smtp.gmail.com'
app.config["MAIL_PORT"] = 465
app.config["MAIL_USERNAME"] = 'projecttrial30@gmail.com'
app.config['MAIL_PASSWORD'] = 'jihfydnmtvttitlj'  # you have to give your password of the Gmail account
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
mail = Mail(app)
otp_secret = pyotp.random_base32()

db = os.getenv("DB")

app.config['MONGO_DBNAME'] = 'facedata'
app.config['MONGO_URI'] = db
app.config['JWT_SECRET_KEY'] = 'secret'

client = MongoClient(app.config['MONGO_URI'])
db = client[app.config['MONGO_DBNAME']]

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

CORS(app)

@app.route('/users/register', methods=["POST"])
def register():
    users = db.users
    username = request.get_json()['username']
    email = request.get_json()['email']
    account = request.get_json()['account']
    password = bcrypt.generate_password_hash(request.get_json()['password']).decode('utf-8')
    facialRecognitionEnabled = request.get_json()['facialRecognitionEnabled']
    threshold = request.get_json()['threshold']
    created = datetime.utcnow()

    user_id = users.insert_one({
        'username': username,
        'email': email,
        'account': account,
        'password': password,
        'facialRecognitionEnabled': facialRecognitionEnabled,
        'threshold': threshold,
        'created': created
    }).inserted_id

    new_user = users.find_one({'_id': ObjectId(user_id)})

    result = {'email': new_user['email'] + ' registered'}

    return jsonify({'result': result})

@app.route('/users/login', methods=['POST'])
def login():
    users = db.users
    username = request.get_json()['username']
    password = request.get_json()['password']
    result = ""

    response = users.find_one({'username': username})

    if response:
        if bcrypt.check_password_hash(response['password'], password):
            access_token = create_access_token(identity={
                'username': response['username']
            })
            result = jsonify({'token': access_token})
        else:
            result = jsonify({"error": "Invalid username and password"})
    else:
        result = jsonify({"result": "No results found"})
    return result

@app.route('/txn/transaction', methods=['POST'])
def transaction():
    users = db.users
    txn = db.txn
    username = request.get_json()['username']
    # password = request.get_json()['password']
    account = request.get_json()['account']
    reciever_name = request.get_json()['reciever_name']
    recieveraccount_number = request.get_json()['recieveraccount_number']
    amount = request.get_json()['amount']

    response = users.find_one({'username': username})
  
    email = response['email']
    totp = pyotp.TOTP(otp_secret)
    otp = totp.now()
    try:
        msg = Message(subject='OTP', sender='projecttrial30@gmail.com', recipients=[email])
        msg.body = str(otp)
        mail.send(msg)
        print('result: OTP sent')
    except Exception as e:
        print(e)
        print('result: Error occurred while sending OTP')

    txn_id = txn.insert_one({
        'username': username,
        'account': account,
        'reciever_name': reciever_name,
        'recieveraccount_number': recieveraccount_number,
        'amount': amount,
    }).inserted_id

    new_txn = txn.find_one({'_id': ObjectId(txn_id)})

    result = {'username': new_txn['username'] + ' new transaction'}
    return jsonify({'result': result})


@app.route('/verify', methods=['POST'])
def validate():
    # user_otp = request.form['otp']
    user_otp = request.get_json()['otp']
    totp = pyotp.TOTP(otp_secret)
    if totp.verify(user_otp):
        print(user_otp)
        return jsonify({'message': 'OTP is correct'})
    else:
        return jsonify({'message': 'OTP is incorrect'})


if __name__ == '__main__':
    app.run(debug=True)
