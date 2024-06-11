from flask import Flask, request, jsonify
from bark import generate_speech

app = Flask(__name__)

@app.route('/tts', methods=['POST'])
def tts():
    data = request.json
    text = data.get('text')
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    try:
        # Generate speech
        audio_path = generate_speech(text, output_path='output.wav')
        return jsonify({'audio_url': audio_path})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
