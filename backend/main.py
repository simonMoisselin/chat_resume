import json
import logging
import os
from typing import Dict, List

import modal
from fastapi import Header, Request
from fastapi.responses import RedirectResponse, StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from modal import web_endpoint
from pydantic import BaseModel

logger = logging.getLogger(__name__)

import pathlib

volume = modal.NetworkFileSystem.persisted("resumes-volume")

CACHE_DIR = "/cache"
UPLOADED_RESUMES_DIR = pathlib.Path(CACHE_DIR, "uploaded_resumes")
app_image = (
    modal.Image.debian_slim().apt_install("poppler-utils").pip_install("openai==1.1.1","numpy","Pillow","pdf2image")
)

stub = modal.Stub(
    "resume-v1",
    image=app_image,
    secrets=[modal.Secret.from_name("twitter")], # TODO update the resume
)


# TODO also update the corresponding job description

system_content = """
You are receiving picture of resumes and your goal is to review it. 
Tell which quotes I need to change explicitly, 

```
## Minor Changes
(Show a table with 3 columns: `Quote`, `Change`, `Explanation`, then a conclusion for how to be more professional in general)

## Scoring
(Should have 1 quote for overall score, then show a table with score grade per section - with those columns: `Section`, `Score`, `Next Steps`)

...

## Remarks
Description of things candidate should learn to improve the overal content of the resume (not the form, but actually cool project to shine)
```
...

- score is between 0 and 10
- Be concise, and friendly, this will appear in a website after user uploads a resume. Make encouraging comments if possible
- If the image is not a resume, send `This image is not a resume, it's a `<picture of xxx>`, please try again.`
- Make the review of the resume in the language the resume is in (if it's in French, review it in French, if it's in English, review it in English etc)
"""



# system_content = "Just send a fake markdown text of ~5 lines with a header"
from typing import Dict

import openai
from fastapi import FastAPI, File, UploadFile


@stub.function()
def call_openai(messages, max_tokens, model="gpt-4-1106-preview"):
    import openai

    try:
        completion = openai.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.,
        max_tokens=max_tokens,
        stream=True 
    )
        for i, chunk in enumerate(completion):
        # extract the message
            chunk_message = chunk.choices[0].delta.content
            if chunk_message is not None:
                yield chunk_message
    except Exception as e:
        print(e)
        # yield error message
        yield str(e)
    
def verify_token(token):
    # TODO: Implement token verification logic
    # This should validate the token and return True if the token is valid
    import os
    return token == os.environ['AUTH_TOKEN_RESUME']





@stub.function(    network_file_systems={CACHE_DIR: volume},
)
@web_endpoint(
    method="POST",
)
def review_resume(request: Request,image: UploadFile):
    # only review the image of the file - TODO later on take care of PDF
    UPLOADED_RESUMES_DIR.mkdir(parents=True, exist_ok=True)
    import base64
    import io

    from pdf2image import convert_from_bytes
    
    file_extension = image.filename.split('.')[-1].lower()
    file_data = image.file.read()
    import datetime
    filename_dated = f"{image.filename}_{datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.{file_extension}"
    dest_file = pathlib.Path(UPLOADED_RESUMES_DIR, filename_dated)
    with open(dest_file, "wb") as f:
        f.write(file_data)
        print(f"Saved {dest_file}")

    if file_extension in ["jpg", "jpeg", "png"]:
        # It's an image, process as before
        image_bytes = file_data
    elif file_extension == "pdf":
        # It's a PDF, convert to image
        # await not allowed in function but get the image.read() as bytes
        pdf_bytes = file_data
        images = convert_from_bytes(pdf_bytes)
        if images:
            image_bytes = io.BytesIO()
            images[0].save(image_bytes, format='JPEG')
            image_bytes = image_bytes.getvalue()
        else:
            return {"error": "The PDF file is empty"}, 400
    else:
        return {"error": "Unsupported file type"}, 400
    base64_img = base64.b64encode(image_bytes).decode("utf-8")

    auth_header = request.headers.get("Authorization")
    if not auth_header:
        # No Authorization header present
        return {"error": "Authorization header is missing"}, 401
    token_type, _, access_token = auth_header.partition(' ')
    if token_type != "Bearer" or not access_token:
        # The Authorization header is malformed or the token is missing
        return {"error": "Invalid Authorization header"}, 401
    # TODO: Add your method here to verify the access token
    if not verify_token(access_token):
        # The token is invalid
        return {"error": "Invalid token"}, 403
    
    # only 1 image for now
    content_images = [{"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_img}"}}]
    messages = [
        {"role": "system", "content": [{"type": "text", "text": system_content}]}
    ] + [{"role": "user", "content": content_images}]
    response = call_openai.local(messages, max_tokens=2000, model="gpt-4-vision-preview")
    return StreamingResponse(
        response,
        media_type="text/event-stream"
    )

    

