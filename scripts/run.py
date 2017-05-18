from flask import Flask, request
import os
app = Flask(__name__, static_url_path='', static_folder='../')


port = os.environ['PORT'] if 'PORT' in os.environ else 5000

@app.route('/')
def root():
    return app.send_static_file('index.html')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=port)
