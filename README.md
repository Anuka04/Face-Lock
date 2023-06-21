# Face-Lock

![banner](https://github.com/Anuka04/Face-Lock/assets/79411679/e658167c-ced8-425c-936e-a13e47ff6b53)

Our project aims to create a facial recognition-based secure and user-friendly authentication method for digital transactions. Our solution moves away from conventional approaches like OTPs, which are susceptible to phishing and hacking attacks, and instead incorporates the use of facial recognition technology.

## Project Description

Face-Lock is a facial recognition-based authentication system designed to enhance the security and convenience of digital transactions. By leveraging facial recognition technology, we provide a robust and user-friendly alternative to traditional authentication methods like OTPs. Our solution offers an extra layer of protection against fraud and unauthorized access, ensuring a seamless and secure experience for users.

## Getting Started

To get started with Face-Lock, follow the instructions below:

1. Clone the repository and navigate to the project folder:

   ```bash
   git clone https://github.com/your-username/Face-Lock.git
   cd Face-Lock
   ```

2. Download the Machine Learning Model:

The Machine Learning model used by Face-Lock is not included in the repository due to its large file size. Please open the following link to access the model:

[Download Face-Lock Model](https://drive.google.com/drive/folders/1X2xiv2WdVnAF_1swaHiJwb5Ehd7jHy2e?usp=sharing)

Once downloaded, extract the contents of the model folder and place it in the main clone folder.

3. Set up the Database Connection:

Create an .env file in the server and ml-server folders. 
Format:

```
DB_URL=
MAIL_SERVER=
EMAIL=
DB_NAME=
SECRET=
SECRET_KEY=
FERNET=
```

4. Install Dependencies:

Install the dependencies for each folder:

client (Frontend):

```
cd client
npm install
```

server (Backend):

```
cd server
pip install -r requirements.txt
```

ml-server (Machine Learning Server):

```
cd ml-server
pip install -r requirements.txt
```

5. Run the Application:

Open three separate terminals and run the following commands:

Terminal 1 (Server):

```
cd server
python mongo.py
```

Terminal 2 (Machine Learning Server):

```
cd ml-server
python backend.py
```

Terminal 3 (Client):

```
cd client
npm start
```

This will start the application, and you will have your database running.

Feel free to explore and test the Face-Lock application with your own database configuration. Enjoy secure and user-friendly authentication for digital transactions!

###### Want to know more about our project?
- Figma Design: [Click here to view our prototype!](https://www.figma.com/file/9eJtMqHwr06IMbGhWJrqIt/AMEX?type=design&node-id=0%3A1&t=flD4hwNo299feTb2-1)
- YouTube Video: [Click here to view our demo!](https://www.youtube.com/watch?v=J4oh8gtIb34)

------------
<p align="center">
Made with 💙
</p>

