from flask import Flask
from flask import request
from flask import jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return open('upload.html').read()

@app.route('/uploadHandler/', methods=['GET', 'POST'])
def uploadHandler():
    print 'HERE'
    print 'FILES', len(request.files)
    print request.method
    return jsonify({'files': []})

if __name__ == '__main__':
    app.run()