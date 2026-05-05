import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

NO_IMAGE_URL = "https://development-and-testing-bucket-abcdxyz1234.s3.ap-south-1.amazonaws.com/no-pictures.png"


@app.route("/")
def base_app():
    return jsonify({
        "status": "App is running..."
    })


@app.route("/news", methods=["GET"])
def read_all_news():
    res = supabase.table("news").select("*").order("id", desc=True).execute()

    return jsonify({
        "news": res.data
    }), 200


@app.route("/news", methods=["POST"])
def create_news():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Please send JSON data with Content-Type: application/json"
        }), 400

    required_fields = ["title", "source", "description", "url", "category"]

    for field in required_fields:
        if not data.get(field):
            return jsonify({
                "error": f"{field} is required"
            }), 400

    new_news = {
        "title": data["title"],
        "source": data["source"],
        "description": data["description"],
        "thumbnail": data.get("thumbnail") or NO_IMAGE_URL,
        "url": data["url"],
        "category": data["category"].lower()
    }

    res = supabase.table("news").insert(new_news).execute()

    return jsonify({
        "message": "News added successfully",
        "news": res.data
    }), 201


@app.route("/news/<int:news_id>", methods=["DELETE"])
def delete_news(news_id):
    check = supabase.table("news").select("*").eq("id", news_id).execute()

    if not check.data:
        return jsonify({
            "error": "News not found"
        }), 404

    res = supabase.table("news").delete().eq("id", news_id).execute()

    return jsonify({
        "message": "News deleted successfully",
        "data": res.data
    }), 200


@app.route("/news/<int:news_id>", methods=["PUT", "PATCH"])
def update_news(news_id):
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Send valid JSON data"
        }), 400

    check = supabase.table("news").select("*").eq("id", news_id).execute()

    if not check.data:
        return jsonify({
            "error": "News not found"
        }), 404

    allowed_fields = [
        "title",
        "source",
        "description",
        "thumbnail",
        "url",
        "category"
    ]

    update_data = {}

    for field in allowed_fields:
        if field in data:
            update_data[field] = data[field]

    if "category" in update_data:
        update_data["category"] = update_data["category"].lower()

    if not update_data:
        return jsonify({
            "error": "No valid fields to update"
        }), 400

    res = supabase.table("news").update(update_data).eq("id", news_id).execute()

    return jsonify({
        "message": "News updated successfully",
        "news": res.data
    }), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)