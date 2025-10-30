import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
import json
from datetime import datetime # Needed for background task logging
from urllib.parse import urlparse, urlunparse

from fastapi import FastAPI, HTTPException, Depends, Header, BackgroundTasks, File, UploadFile
from pydantic import BaseModel
from supabase import create_client, Client
from decouple import config
from fastapi.middleware.cors import CORSMiddleware

from google.cloud import vision
import base64
import io
import uuid # For generating unique filenames

# --- Selenium Imports ---
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.common.exceptions import WebDriverException
import time
# ------------------------

# --- Load keys from .env file ---
try:
    SUPABASE_URL = config('SUPABASE_URL')
    SUPABASE_KEY = config('SUPABASE_KEY')
    GEMINI_API_KEY = config('GEMINI_API_KEY')
    # GOOGLE_APPLICATION_CREDENTIALS should be set in the environment (e.g., Render Env Vars or .env)
    # config('GOOGLE_APPLICATION_CREDENTIALS') # python-decouple can load it implicitly if set
    if not SUPABASE_URL or not SUPABASE_KEY or not GEMINI_API_KEY:
        raise ValueError("Supabase URL/Key and Gemini API Key must be set in .env file")
except Exception as e:
    print(f"FATAL: Error loading environment variables: {e}")
    exit()

# --- Client Setups ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
genai.configure(api_key=GEMINI_API_KEY)
app = FastAPI()

# --- CORS Middleware ---
origins = [
    "http://localhost:3000",
    "https://stash-frontend-chi.vercel.app",
    "https://stashfronrtend.vercel.app",
    "https://stash2frontend.vercel.app" # Typo? Check if this URL is correct
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class UserAuth(BaseModel):
    email: str
    password: str

class CaptureItem(BaseModel): # Used for URL/Text capture
    type: str
    content: str

# --- Simple Auth "Guard" ---
async def get_current_user_email(x_user_email: str | None = Header(None, alias="X-User-Email")) -> str:
    if not x_user_email:
        raise HTTPException(status_code=401, detail="X-User-Email header missing")
    return x_user_email

# --- Selenium Web Scraper Function ---
def get_text_from_url(url):
    print(f"Attempting to load URL with Selenium: {url}")
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    options.add_argument("--window-size=1920,1080")

    driver = None
    try:
        # Check if running in Render/Linux environment where binary path might be fixed
        chrome_binary_location = config('CHROME_BINARY_LOCATION', default=None) 
        if chrome_binary_location:
             options.binary_location = chrome_binary_location
             # May need to specify driver path explicitly too if not using webdriver-manager in Docker
        
        # Use webdriver-manager locally, might need adjustment for deployment without Docker
        service = ChromeService(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        
        driver.set_page_load_timeout(60)
        driver.get(url)
        time.sleep(3) # Wait for JS

        body_element = driver.find_element(By.TAG_NAME, 'body')
        text = body_element.text.strip()
        lines = (line.strip() for line in text.splitlines())
        cleaned_text = '\n'.join(line for line in lines if line)
        print(f"Selenium scrape successful for {url}. Got {len(cleaned_text)} chars.")
        return cleaned_text[:15000]

    except WebDriverException as e:
        print(f"Selenium WebDriver error for URL {url}: {e}")
        # Specific check for binary not found
        if "cannot find Chrome binary" in str(e):
             print("FATAL: Chrome binary not found. Ensure Chrome is installed and path is correct (e.g., via Docker or CHROME_BINARY_LOCATION env var).")
        return None
    except Exception as e:
        print(f"Unexpected Selenium error for URL {url}: {e}")
        return None
    finally:
        if driver:
            driver.quit()

# --- Google Cloud Vision - Tagging Function ---
def get_tags_from_image_bytes(image_bytes: bytes) -> list[str] | None:
    try:
        client = vision.ImageAnnotatorClient() # Assumes GOOGLE_APPLICATION_CREDENTIALS env var is set
        image = vision.Image(content=image_bytes)
        print("Sending image bytes to Google Cloud Vision (Label Detection)...")
        response = client.label_detection(image=image)
        if response.error.message: raise Exception(f"GCV Label API error: {response.error.message}")
        labels = [label.description.lower() for label in response.label_annotations if label.score > 0.75]
        print(f"GCV Labels detected: {labels if labels else 'None'}")
        return labels if labels else [] # Return empty list if none found
    except Exception as e:
        print(f"ERROR during GCV Label Detection: {e}")
        return None # Indicate failure

# --- Google Cloud Vision - OCR Function ---
def get_text_from_image_bytes_gcv(image_bytes: bytes) -> str | None:
    try:
        client = vision.ImageAnnotatorClient()
        image = vision.Image(content=image_bytes)
        print("Sending image bytes to Google Cloud Vision (OCR)...")
        response = client.text_detection(image=image)
        if response.error.message: raise Exception(f"GCV OCR API error: {response.error.message}")
        if response.text_annotations:
            detected_text = response.text_annotations[0].description
            if detected_text and len(detected_text.strip()) > 10:
                print(f"GCV OCR successful, extracted {len(detected_text)} chars.")
                cleaned_text = '\n'.join(line.strip() for line in detected_text.splitlines() if line.strip())
                return cleaned_text[:15000]
        print("GCV OCR found no significant text.")
        return None
    except Exception as e:
        print(f"ERROR during GCV OCR processing: {e}")
        return None

# --- Gemini Configuration ---
generation_config = { "temperature": 0.2, "top_p": 1, "top_k": 1, "max_output_tokens": 2048, "response_mime_type": "application/json"}
safety_settings = [ {"category": c, "threshold": "BLOCK_MEDIUM_AND_ABOVE"} for c in ["HARM_CATEGORY_HARASSMENT", "HARM_CATEGORY_HATE_SPEECH", "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_DANGEROUS_CONTENT"]]
try:
    gemini_model = genai.GenerativeModel(model_name="gemini-2.5-flash-lite", generation_config=generation_config, safety_settings=safety_settings)
except Exception as e:
    print(f"FATAL: Error creating Gemini model: {e}")
    gemini_model = None


# --- NEW: AI Keyword Extractor ---
def get_keywords_from_query(query: str) -> list[str] | None:
    """
    Uses Gemini to extract key search terms from a natural language query.
    """
    if not query or not gemini_model:
        return None
    
    # Prompt Gemini to act as a search parser
    prompt = f"""
    Analyze the following user search query. Extract the most important keywords and entities.
    - Be concise.
    - Return ONLY a valid JSON list of lowercase strings.
    - Do not include categories, just the search terms.
    
    Examples:
    - Query: "recipes with chicken and garlic"
    - Response: ["recipe", "chicken", "garlic"]
    - Query: "tech articles about python"
    - Response: ["tech", "article", "python"]
    - Query: "that movie with Christopher Nolan"
    - Response: ["movie", "christopher nolan"]
    
    User Query:
    "{query}"
    """
    
    try:
        print(f"Sending query to Gemini for keyword extraction: '{query}'")
        # Set response mime type for this specific call if not set globally
        config_with_json = generation_config.copy()
        config_with_json["response_mime_type"] = "application/json"
        
        # Create a model instance for this call (or ensure global model has json type)
        json_model = genai.GenerativeModel(
            model_name="gemini-2.5-flash-lite",
            generation_config=config_with_json,
            safety_settings=safety_settings
        )
        
        response = json_model.generate_content(prompt)
        keywords = json.loads(response.text)
        
        if isinstance(keywords, list):
            print(f"Gemini extracted keywords: {keywords}")
            return keywords
        else:
            print("WARNING: Gemini did not return a list for keywords.")
            return None

    except json.JSONDecodeError as json_e:
        print(f"ERROR: Gemini keyword response not valid JSON: {json_e}")
        try: print("Raw Gemini response:", response.text)
        except: pass
        return None
    except Exception as e:
        print(f"ERROR: Gemini keyword extraction failed: {e}")
        return None
    


# --- Gemini "Brain" Function ---
def get_json_from_gemini(content: str):
    if not content or not gemini_model: return None
    prompt = f"""
    Analyze the text. Classify it and extract details.
    **Instructions:**
    1. Extract **title**.
    2. Write a 1-2 sentence **summary**.
    3. Choose one **primary_category** from: "Programming", "Technology", "Science", "News", "Food & Recipe", "Movies & TV", "Books & Literature", "Travel & Places", "People", "Health & Fitness", "Shopping & Product", "Music", "Gaming", "Finance", "Education", "Other".
    4. Generate 5-10 specific lowercase **specific_tags**.
    5. Extract relevant **key_info** (author, director, brand, price, ingredients, etc.).
    6. Respond ONLY with valid JSON matching the schema.
    **JSON Schema:** {{ "title": "string", "summary": "string", "primary_category": "string", "specific_tags": ["string", ...], "key_info": {{ "detail_1": "value_1", ... }} }}
    **Text:** --- {content} ---
    """
    try:
        print(f"Sending request to Gemini ({len(content)} chars)...")
        response = gemini_model.generate_content(prompt)
        json_response = json.loads(response.text)
        print("Gemini processing successful.")
        # Basic Validation
        json_response.setdefault('title', 'Processing Issue')
        json_response.setdefault('summary', '')
        json_response.setdefault('primary_category', 'Other')
        json_response.setdefault('specific_tags', [])
        json_response.setdefault('key_info', {})
        if not isinstance(json_response.get('specific_tags'), list): json_response['specific_tags'] = []
        return json_response
    except json.JSONDecodeError as json_e:
        print(f"ERROR: Gemini response not valid JSON: {json_e}")
        try: print("Raw Gemini response:", response.text)
        except: pass
        return None
    except Exception as e:
        print(f"ERROR: Gemini API call failed: {e}")
        try: print("Gemini prompt feedback:", response.prompt_feedback)
        except: pass
        return None

# --- Background Task Function (REVISED for Unified Vision + Gemini on OCR + Debug Log) ---
def process_item_async(item_id: str, original_content_for_processing: str | None = None):
    """
    Background task to process items:
    - URLs/Text: Scrape -> Gemini
    - Images: Download -> Vision Tagging -> Vision OCR -> Gemini (if text found) -> Update DB
    """
    print(f"[{datetime.utcnow()}] Background processing started (Unified Vision) for item_id: {item_id}")
    processed_data_final = None
    smart_stack = 'Other' # Default category
    final_status = 'failed' # Default status
    vision_tags = []      # Tags from Vision Label Detection
    ocr_text = None         # Text from Vision OCR
    gemini_analysis = None  # Analysis from Gemini based on OCR text

    try:
        # 1. Fetch item details from DB
        fetch_response = supabase.table('items').select('id, raw_content, content_type').eq('id', item_id).limit(1).execute()
        if not fetch_response.data:
            print(f"ERROR: Item {item_id} not found for background processing.")
            return # Exit if item not found
        item_data = fetch_response.data[0]

        # --- ADDED DEBUG LOG ---
        retrieved_content_type = item_data.get('content_type')
        retrieved_content = item_data.get('raw_content')
        print(f"Background task fetched item {item_id}. Type='{retrieved_content_type}', Content Exists: {bool(retrieved_content)}")
        # -----------------------

        # Use the retrieved values
        content_type = retrieved_content_type
        content = retrieved_content

        extracted_text_for_gemini = None # Holds text from URL/Text scrape OR OCR result

        # 2. Process based on content type
        if content_type == 'url' and content:
            print(f"Scraping URL: {content}")
            extracted_text_for_gemini = get_text_from_url(content) # Use Selenium scraper
            if not extracted_text_for_gemini:
                print(f"Scraping failed or returned no text for {item_id}.")
                final_status = 'failed_extraction' # Mark specific failure

        elif content_type == 'text' and content:
             extracted_text_for_gemini = content # Use raw text directly
             print(f"Using raw text content for item {item_id}.")

        # --- Image Processing ---
        elif content_type == 'image_url' and content:
            print(f"Processing image URL (Vision Tagging + OCR): {content}")
            image_bytes = None
            try:
                # Download image bytes
                image_response = requests.get(content, timeout=25) # Increased timeout
                image_response.raise_for_status()
                image_bytes = image_response.content
                print(f"Downloaded {len(image_bytes)} bytes from image URL {item_id}.")
            except requests.exceptions.RequestException as req_e:
                print(f"ERROR: Failed to download image for {item_id} from {content}: {req_e}")
                final_status = 'failed_download'

            if image_bytes:
                # --- Run Cloud Vision Tagging ---
                try:
                    temp_tags = get_tags_from_image_bytes(image_bytes) # Calls the label detection function
                    if temp_tags is not None: # API call succeeded (even if list is empty)
                         vision_tags = temp_tags
                         # Tentatively set status/stack based on vision success
                         final_status = 'processed'
                         smart_stack = 'Image' # Default stack for images if no text found/processed
                         print(f"Vision Tagging successful for {item_id}. Tags: {vision_tags}")
                    else:
                         # API call itself failed
                         print(f"Cloud Vision Tagging API call failed for item {item_id}.")
                         # Keep status as 'failed' (initial value)
                except Exception as vision_e:
                     # Catch unexpected errors during the call
                     print(f"ERROR during Cloud Vision Tagging call for {item_id}: {vision_e}")
                     # Keep status as 'failed'

                # --- Run Cloud Vision OCR ---
                try:
                    temp_ocr_text = get_text_from_image_bytes_gcv(image_bytes) # Calls the text detection function
                    if temp_ocr_text:
                        extracted_text_for_gemini = temp_ocr_text # Use OCR text for Gemini stage
                        print(f"Cloud Vision OCR successful for {item_id}, text found.")
                    else:
                        print(f"Cloud Vision OCR found no significant text for {item_id}.")
                except Exception as ocr_e:
                    print(f"ERROR during Cloud Vision OCR for {item_id}: {ocr_e}")
                    # Keep going, tagging might have worked
        # --- END Image Processing ---

        else: # Handle skipped types
             print(f"Skipping processing for item {item_id} with content_type: '{content_type}'") # Log the type causing skip
             final_status = 'skipped'

        # 3. Call Gemini (If we have text from ANY source: URL, Text, or OCR)
        if extracted_text_for_gemini:
            print(f"Sending extracted text ({len(extracted_text_for_gemini)} chars) to Gemini for item {item_id}...")
            gemini_result = get_json_from_gemini(extracted_text_for_gemini) # Calls your existing Gemini function
            if gemini_result and isinstance(gemini_result, dict):
                print(f"Gemini processing successful for item {item_id}.")
                gemini_analysis = gemini_result # Store Gemini result
                # *** PRIORITIZE Gemini's category for smart_stack ***
                smart_stack = gemini_result.get('primary_category', smart_stack) # Fallback to 'Image' or 'Other' if key missing
                final_status = 'processed' # Ensure status is processed if Gemini worked
            else:
                print(f"Gemini processing failed for item {item_id}.")
                # If Vision tagging worked earlier, the status might already be 'processed'.
                # Decide if Gemini failure overrides Vision success. Let's make it fail overall.
                final_status = 'failed_gemini'
        elif final_status != 'failed_download' and final_status != 'skipped': # If no text extracted and not already failed/skipped
             # This applies if URL scraping failed, or if it was an image with no OCR text
             print(f"No text to send to Gemini for item {item_id}.")
             # If Vision tagging worked, keep 'processed' status. Otherwise, mark failure.
             if not vision_tags and final_status != 'failed': final_status = 'failed_extraction'


        # --- Combine Results into final processed_data ---
        # Ensure status consistency: if no data but status is processed, mark failed
        if final_status == 'processed' and not gemini_analysis and not vision_tags:
             print(f"Warning: Item {item_id} marked as processed but no Gemini analysis or Vision tags found. Setting status to failed.")
             final_status = 'failed'

        if final_status == 'processed':
            processed_data_final = {} # Start fresh
            # Add Gemini analysis if available
            if gemini_analysis:
                 processed_data_final.update(gemini_analysis)
                 # Ensure defaults if Gemini output is partial
                 processed_data_final.setdefault('title', 'Processing Issue')
                 processed_data_final.setdefault('summary', '')
                 processed_data_final.setdefault('primary_category', smart_stack)
                 processed_data_final.setdefault('specific_tags', [])
                 processed_data_final.setdefault('key_info', {})

            # Add Vision tags always if they exist
            if vision_tags:
                 processed_data_final['image_tags'] = vision_tags # Add specific key for vision tags
                 # If Gemini *didn't* run (e.g., photo with no text), create basic structure using tags
                 if not gemini_analysis:
                      processed_data_final.setdefault('title', f"Image - {vision_tags[0]}" if vision_tags else "Image")
                      processed_data_final.setdefault('summary', f"Detected: {', '.join(vision_tags[:5])}{'...' if len(vision_tags) > 5 else ''}")
                      processed_data_final.setdefault('primary_category', 'Image') # Default category if only vision
                      processed_data_final.setdefault('specific_tags', vision_tags) # Use vision tags as specific tags in this case
                      processed_data_final.setdefault('key_info', {})

            # Final check for essential fields if somehow missed
            processed_data_final.setdefault('title', 'Processed Item')
            processed_data_final.setdefault('primary_category', smart_stack)
            processed_data_final.setdefault('specific_tags', [])

        elif final_status != 'pending': # If failed or skipped
             processed_data_final = None # Clear data

    except Exception as e:
        # Catch-all for unexpected errors during the main try block
        print(f"ERROR: Unhandled exception in background task for {item_id}: {e}")
        final_status = 'failed'
        processed_data_final = None # Ensure data is cleared

    finally:
        # 4. Update Database Item
        try:
            update_payload = {
                'status': final_status,
                'processed_data': processed_data_final, # Use the combined/final data
                'smart_stack': smart_stack
            }
            # Allow setting processed_data to None if status indicates failure/skip
            update_payload = {k: v for k, v in update_payload.items() if k == 'processed_data' or v is not None}

            # Only update if status changed from pending or processed_data is being set/cleared
            if update_payload.get('status') != 'pending' or 'processed_data' in update_payload:
                 update_response = supabase.table('items').update(update_payload).eq('id', item_id).execute()
                 # Add more detailed logging on update result
                 log_data_summary = f"Processed Data: {'Set' if processed_data_final else 'Cleared'}"
                 print(f"[{datetime.utcnow()}] DB update for {item_id}: Status={final_status}, Stack={smart_stack}. {log_data_summary}.")
                 # Optional: Check update_response for errors from Supabase
                 # if hasattr(update_response, 'error') and update_response.error:
                 #    print(f"WARNING: Supabase DB update potentially failed for {item_id}: {update_response.error}")
            else:
                 print(f"[{datetime.utcnow()}] No final DB updates needed for {item_id} (status likely still pending).")
        except Exception as db_e:
            print(f"ERROR: DB update failed critically for {item_id}: {db_e}")


# --- Endpoint: Signup (Unchanged) ---
@app.post("/v1/signup")
async def signup(user: UserAuth):
    # ... (Same code as before)
    try:
        response = supabase.table('users').insert({'email': user.email, 'password': user.password}).execute()
        if response.data: return {"email": response.data[0]['email']}
        else: raise Exception("Signup failed")
    except Exception as e:
        if 'users_email_key' in str(e): raise HTTPException(status_code=409, detail="Email already exists")
        else: raise HTTPException(status_code=500, detail=str(e))

# --- Endpoint: Login (Unchanged) ---
@app.post("/v1/login")
async def login(user: UserAuth):
    # ... (Same code as before)
    try:
        response = supabase.table('users').select('*').eq('email', user.email).limit(1).execute()
        if not response.data: raise HTTPException(status_code=404, detail="Email not found")
        db_user = response.data[0]
        if db_user['password'] == user.password: return {"email": db_user['email']}
        else: raise HTTPException(status_code=401, detail="Incorrect password")
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        else: raise HTTPException(status_code=500, detail=str(e))


# --- Endpoint: AI-assisted Keyword Search (USING RPC - No significant change needed) ---
class SearchQuery(BaseModel):
    query: str

@app.post("/v1/search")
async def search_items(
    query: SearchQuery,
    user_email: str = Depends(get_current_user_email)
):
    """
    Performs AI-assisted keyword search using the updated Supabase RPC function
    that searches within processed_data (prioritizing tags) and smart_stack.
    """
    if not query.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")

    try:
        # 1. Get keywords from Gemini (Unchanged)
        keywords = get_keywords_from_query(query.query)
        if not keywords:
            keywords = query.query.lower().split() 
            print(f"Gemini keyword extraction failed/skipped. Falling back to: {keywords}")
        if not keywords: return {"items": []} 

        # 2. Call the Supabase RPC function (Unchanged)
        print(f"Calling Supabase RPC 'search_items_by_keyword' for user '{user_email}' with keywords: {keywords}")
        response = supabase.rpc('search_items_by_keyword', {
            'p_user_email': user_email,
            'p_keywords': keywords # Pass keywords as a Python list
        }).execute()
        
        # 3. Handle response (Unchanged - includes relevance_score now)
        if hasattr(response, 'data'):
            search_results = response.data
            print(f"Search RPC found {len(search_results)} matching items (sorted by relevance).")
            # The results are already sorted by relevance by the SQL function
            return {"items": search_results} 
        else:
             # ... (Error handling remains the same) ...
             if hasattr(response, 'error') and response.error:
                 print(f"Supabase RPC search error: {response.error}")
                 raise HTTPException(status_code=500, detail=f"Database search RPC error: {response.error.message}")
             print("Search RPC returned no data or unexpected structure.")
             return {"items": []}

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"ERROR during search processing: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during search.")






# --- Endpoint: Capture URL/Text (MODIFIED TO CLEAN URL) ---
# @app.post("/v1/capture")
# async def capture_item(
#     item: CaptureItem,
#     background_tasks: BackgroundTasks,
#     user_email: str = Depends(get_current_user_email)
# ):
#     if item.type not in ['url', 'text']:
#         raise HTTPException(status_code=400, detail="Use /v1/capture/image for images")
#     if not item.content:
#          raise HTTPException(status_code=400, detail="Content cannot be empty.")

#     item_id = None
#     cleaned_content = item.content # Default to original content

#     # --- NEW: Clean URL if type is 'url' ---
#     if item.type == 'url':
#         try:
#             parsed_url = urlparse(item.content)
#             # Reconstruct URL without query, fragment, params
#             cleaned_content = urlunparse((
#                 parsed_url.scheme,
#                 parsed_url.netloc,
#                 parsed_url.path,
#                 '', # No params
#                 '', # No query
#                 ''  # No fragment
#             ))
#             print(f"Original URL: {item.content}, Cleaned URL: {cleaned_content}")
#         except Exception as parse_e:
#             print(f"Warning: Could not parse URL '{item.content}'. Using original. Error: {parse_e}")
#             cleaned_content = item.content # Fallback to original if parsing fails
#     # ------------------------------------

#     try:
#         insert_response = supabase.table('items').insert({
#             'content_type': item.type,
#             # --- FIX: Use cleaned_content ---
#             'raw_content': cleaned_content, 
#             'status': 'pending', 
#             'user_email': user_email
#         }).execute()
        
#         if not insert_response.data: raise HTTPException(status_code=500, detail="Failed to save item.")
        
#         item_id = insert_response.data[0]['id']
        
#         # Pass the ORIGINAL URL (item.content) to the background task for scraping
#         # as query params might sometimes be necessary for the site to load correctly.
#         # The database will store the cleaned version.
#         # Always pass the cleaned content (URL without query params, or text)
#         background_tasks.add_task(process_item_async, item_id, cleaned_content) 
        
#         print(f"Item {item_id} ({item.type}) captured, task added using original URL if applicable.")
#         return {"status": "success", "data": insert_response.data[0]}
    
#     except Exception as e:
#          print(f"Error capturing {item.type}: {e}")
#          if isinstance(e, HTTPException): raise e
#          raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/capture")
async def capture_item(
    item: CaptureItem,
    background_tasks: BackgroundTasks, # <-- Add BackgroundTasks dependency
    user_email: str = Depends(get_current_user_email)
):
    """
    Saves item with 'pending' status and triggers background processing.
    """
    item_id = None # To store the ID of the newly created item
    try:
        # 1. Insert the item with status 'pending'
        insert_response = supabase.table('items').insert({
            'content_type': item.type,
            'raw_content': item.content,
            'status': 'pending', # <-- Always start as pending
            'user_email': user_email
        }).execute()

        if not insert_response.data or len(insert_response.data) == 0:
             print(f"Capture Supabase Error: Failed to insert item. Response: {insert_response}")
             raise HTTPException(status_code=500, detail="Failed to save item.")

        # Get the ID of the item we just created
        item_id = insert_response.data[0]['id']
        print(f"Item {item_id} captured successfully, status pending.")

        # --- FIX: Add the background task ---
        # Only process URLs and text for now
        if item.type in ['url', 'text']:
             background_tasks.add_task(process_item_async, item_id)
             print(f"Added background task for item {item_id}.")
        else:
             print(f"Skipping background processing for item type {item.type}.")
             # Optionally update status to 'skipped' or similar immediately
             supabase.table('items').update({'status': 'skipped'}).eq('id', item_id).execute()


        # Return success immediately (don't wait for background task)
        return {"status": "success", "data": insert_response.data[0]}

    except HTTPException as http_exc:
        # If we created an item but something else failed, maybe mark it as failed?
        # if item_id:
        #     try: supabase.table('items').update({'status': 'failed'}).eq('id', item_id).execute()
        #     except: pass # Best effort cleanup
        raise http_exc
    except Exception as e:
        print(f"Error capturing item {item_id if item_id else '(unknown)'}: {e}")
        # if item_id:
        #     try: supabase.table('items').update({'status': 'failed'}).eq('id', item_id).execute()
        #     except: pass # Best effort cleanup
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


# --- Endpoint: Capture Image ---
@app.post("/v1/capture/image")
async def capture_image(
    background_tasks: BackgroundTasks,
    user_email: str = Depends(get_current_user_email),
    file: UploadFile = File(...)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type.")
    item_id = None
    file_name = None # Keep track for potential cleanup
    bucket_name = "stash-images"
    try:
        # Generate filename, Upload, Get URL
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'png'
        file_name = f"{user_email.split('@')[0]}_{uuid.uuid4()}.{file_extension}"
        contents = await file.read()
        supabase.storage.from_(bucket_name).upload(file_name, contents, {"content-type": file.content_type})
        image_url = supabase.storage.from_(bucket_name).get_public_url(file_name)
        print(f"Image uploaded: {image_url}")

        # Insert DB record
        insert_response = supabase.table('items').insert({
            'content_type': 'image_url', 'raw_content': image_url,
            'status': 'pending', 'user_email': user_email
        }).execute()
        if not insert_response.data:
             # Try to clean up uploaded file
             try: supabase.storage.from_(bucket_name).remove([file_name])
             except: pass
             raise HTTPException(status_code=500, detail="Failed to save item metadata.")
        item_id = insert_response.data[0]['id']

        # Add background task
        background_tasks.add_task(process_item_async, item_id)
        print(f"Item {item_id} (image_url) captured, task added.")
        return {"status": "success", "data": insert_response.data[0]}
    except Exception as e:
        print(f"Error capturing image: {e}")
        # Try cleanup if upload succeeded but DB failed
        if file_name and not item_id: # Check if upload happened but DB insert didn't
             try: supabase.storage.from_(bucket_name).remove([file_name]); print("Cleaned up orphaned storage file.")
             except: pass
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Image capture error: {str(e)}")

# --- Endpoint: Get Library (Unchanged) ---
@app.get("/v1/library")
async def get_library(user_email: str = Depends(get_current_user_email)):
    try:
        response = supabase.table('items').select('*').eq('user_email', user_email).order('created_at', desc=True).execute()
        return {"items": response.data}
    except Exception as e:
        print(f"Error fetching library: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Endpoint: Root (Unchanged) ---
@app.get("/")
async def root():
    return {"message": "Stash Backend API is running!"}