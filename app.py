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
   return {
       "status": "App is running..."
   }





@app.route("/news")
def read_all_news():
   res = supabase.table("news").select("*").execute()
   return {
       "news": res.data
   }




@app.route("/news", methods=["POST"])
def create_news():
  
   data = request.get_json()
  
   if not data or not data.get("title"):
       return {"error": "title is required"}, 400


   if not data.get("source"):
       return {"error": "source is required"}, 400


   if not data.get("description"):
       return {"error": "description is required"}, 400


   new_product = {
       "title": data["title"],
       "source": data["price"],
       "description": data["rating"],
       "thumbnail": data.get("thumbnail", NO_IMAGE_URL),
   }


   res = supabase.table("news").insert(new_product).execute()


   return { "news": res.data }, 201


#
@app.route("/news/<int:news_id>", methods=["DELETE"])
def delete_news(news_id):


   
   check = supabase.table("news").select("*").eq("id", news_id).execute()


   if not check.data:
       return {"error": "news not found"}, 404


   #
   res = supabase.table("news").delete().eq("id", news_id).execute()


   return {
       "message": "news deleted successfully",
       "data": res.data
   }






@app.route("/news/<int:news_id>", methods=["PUT", "PATCH"])
def update_news(news_id):


   data = request.get_json()


   if not data:
       return {"error": "No data provided"}, 400


  
   check = supabase.table("news").select("*").eq("id", news_id).execute()


   if not check.data:
       return {"error": "news not found"}, 404


   if "source" in data and data["source"] <= 0:
       return {"error": "Invalid source"}, 400


   
   res = supabase.table("news").update(data).eq("id", news_id).execute()


   return {
       "message": "Product updated successfully",
       "product": res.data
   }







if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)