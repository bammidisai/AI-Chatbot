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


# -----------------------------
# HOME PAGE
# -----------------------------
@app.route("/")
def home():
    return render_template("index.html")


# -----------------------------
# CHAT API
# -----------------------------
@app.route("/chat", methods=["POST"])
def chat():

    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "response": "No message data received."
            }), 400

        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({
                "response": "Please enter a message."
            }), 400

        print("User:", user_message)

        # IMPORTANT:
        # One user message = ONE Gemini request
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=user_message
        )

        bot_response = response.text or "No response received."

        print("AI:", bot_response)

        return jsonify({
            "response": bot_response
        }), 200


    except Exception as e:

        error_text = str(e)

        print("Gemini error:", error_text)

        # -----------------------------
        # QUOTA ERROR
        # -----------------------------
        if (
            "429" in error_text
            or "RESOURCE_EXHAUSTED" in error_text
            or "quota" in error_text.lower()
        ):
            return jsonify({
                "response": (
                    "Gemini API quota has been exceeded. "
                    "Please try again after the quota resets."
                )
            }), 429

        # -----------------------------
        # MODEL NOT FOUND
        # -----------------------------
        if "404" in error_text or "NOT_FOUND" in error_text:

            return jsonify({
                "response": (
                    "The Gemini model is not available. "
                    "Please check the model name."
                )
            }), 404

        # -----------------------------
        # OTHER ERROR
        # -----------------------------
        return jsonify({
            "response": "Something went wrong. Please try again."
        }), 500


# -----------------------------
# START APPLICATION
# -----------------------------
if __name__ == "__main__":

    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )