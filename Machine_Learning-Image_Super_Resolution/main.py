from res import models, io
from flask import Flask, request,  Response
from flask_cors import CORS
from waitress import serve

model = models.ESRGAN("models/esrgan.tf")

app = Flask(__name__)
cors = CORS(app)

@app.route('/', methods=['GET', 'POST'])
def upscaler():
    if request.method == 'POST':
        file = request.files['file']
        file_bytes = file.read()
        image = io.load_image_from_bytes(file_bytes)
        output = model(image)
        image_bytes = io.encode_png(output)
        return Response(image_bytes, mimetype='image/png')
    return """
    <form method="POST" enctype="multipart/form-data">
        <input type="file" name="file">
        <input type="submit">
    </form>
    """


serve(app, host='0.0.0.0', port=10_002)
