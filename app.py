from flask import Flask, render_template, request, jsonify
from google import genai
from dotenv import load_dotenv
import os

# Load .env
load_dotenv()

app = Flask(__name__)

# Get Gemini API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is missing")

# Create Gemini client
client = genai.Client(api_key=GEMINI_API_KEY)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "response": "No data received."
            }), 400

        user_message = data.get("message", "").strip()

        print("User:", user_message)

        if not user_message:
            return jsonify({
                "response": "Please enter a message."
            }), 400

        # CURRENT GEMINI MODEL
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=user_message
        )

        bot_response = response.text

        print("AI:", bot_response)

        return jsonify({
            "response": bot_response
        })

    except Exception as e:

        print("GEMINI ERROR:", str(e))

        return jsonify({
            "response": "Gemini error: " + str(e)
        }), 500


if __name__ == "__main__":

    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )