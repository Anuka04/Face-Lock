from flask import Flask, jsonify, request, json
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_jwt_extended import create_access_token
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

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
    account= request.get_json()['account']
    password = bcrypt.generate_password_hash(request.get_json()['password']).decode('utf-8')
    facialRecognitionEnabled= request.get_json()['facialRecognitionEnabled']
    threshold= request.get_json()['threshold']
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
    txn = db.txn
    username = request.get_json()['username']
    account = request.get_json()['account']
    reciever_name = request.get_json()['reciever_name']
    recieveraccount_number = request.get_json()['recieveraccount_number']
    amount = request.get_json()['amount']

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


if __name__ == '__main__':
    app.run(debug=True)
