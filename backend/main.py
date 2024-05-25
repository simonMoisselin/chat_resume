import base64
import datetime
import io
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
from pypdf import PdfReader

volume = modal.NetworkFileSystem.persisted("resumes-volume")

CACHE_DIR = "/cache"
UPLOADED_RESUMES_DIR = pathlib.Path(CACHE_DIR, "uploaded_resumes")
app_image = (
    modal.Image.debian_slim().apt_install("poppler-utils").pip_install("openai==1.30.3","numpy","Pillow","pdf2image", "instructor", "pypdf")
)

stub = modal.Stub(
    "resume-v2",
    image=app_image,
    secrets=[modal.Secret.from_name("twitter")],
)


# interface SectionFeedback {
#   title: string;
#   strengths: string[];
#   improvements: string[];
#   score: number;
# }

# interface ResumeReportProps {
#   candidateName: string;
#   date: string;
#   overallScore: number;
#   sections: SectionFeedback[];
# }
from pydantic import BaseModel
class SectionFeedback(BaseModel):
    title: str
    strengths: List[str]
    improvements: List[str]
    score: float

class ResumeReport(BaseModel):
    candidateName: str
    date: str
    overallScore: float
    sections: List[SectionFeedback]
    candidateEmail: str



# TODO also update the corresponding job description

system_content = """
You are receiving picture of resumes and your goal is to review it. This will be part of a report. 
- scores are between 0 and 100
- Be concise, and friendly, this will appear in a website after user uploads a resume. Make encouraging comments if possible
- If the image is not a resume, send `This image is not a resume, it's a `<picture of xxx>`, please try again.`
- Make the review of the resume in the language the resume is in (if it's in French, review it in French, if it's in English, review it in English etc)
"""



# system_content = "Just send a fake markdown text of ~5 lines with a header"
from typing import Dict

import openai
from openai import OpenAI
from fastapi import FastAPI, File, UploadFile
import instructor 
client = instructor.from_openai(OpenAI())

@stub.function()
def call_openai(messages, max_tokens, model="gpt-4o"):
    import openai
    resume_report = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.,
        max_tokens=max_tokens,
        response_model=ResumeReport
    )
    return resume_report
    
def verify_token(token):
    # TODO: Implement token verification logic
    # This should validate the token and return True if the token is valid
    import os
    return token == os.environ['AUTH_TOKEN_RESUME']





def save_resume(filename, file_data):
    file_extension = image.filename.split('.')[-1].lower()
    filename_dated = f"{image.filename}_{datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.{file_extension}"
    dest_file = pathlib.Path(UPLOADED_RESUMES_DIR, filename_dated)
    with open(dest_file, "wb") as f:
        f.write(file_data)
        print(f"Saved {dest_file}")

@stub.function(    network_file_systems={CACHE_DIR: volume},
)
@web_endpoint(
    method="POST",
)
def review_resume(request: Request,image: UploadFile):
    # only review the image of the file - TODO later on take care of PDF
    from pdf2image import convert_from_bytes
    UPLOADED_RESUMES_DIR.mkdir(parents=True, exist_ok=True)
    
    file_extension = image.filename.split('.')[-1].lower()
    file_data = image.file.read()
    filename = image.filename
    save_resume(filename, file_data)
    
    text = ""
    if file_extension in ["jpg", "jpeg", "png"]:
        image_bytes = file_data

    elif file_extension == "pdf":
        pdf_bytes = file_data
        images = convert_from_bytes(pdf_bytes)
        reader = PdfReader(io.BytesIO(pdf_bytes))
        text = reader.pages[0].extract_text() # assuming only 1 page

        if images:
            image_bytes = io.BytesIO()
            images[0].save(image_bytes, format='JPEG')
            image_bytes = image_bytes.getvalue()
        else:
            return {"error": "The PDF file is empty"}, 400
    else:
        return {"error": "Unsupported file type"}, 400
    base64_img = base64.b64encode(image_bytes).decode("utf-8")



    def auth_pipeline(request: Request):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            # No Authorization header present
            return {"error": "Authorization header is missing"}, 401
        token_type, _, access_token = auth_header.partition(' ')
        if token_type != "Bearer" or not access_token:
            # The Authorization header is malformed or the token is missing
            return {"error": "Invalid Authorization header"}, 401
        if not verify_token(access_token):
            # The token is invalid
            return {"error": "Invalid token"}, 403
        return None
    auth_issues = auth_pipeline(request)
    if auth_issues:
        return auth_issues
    
    # only 1 image for now
    content_images = [{"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_img}"}}]
    if text:
        content_images.append({"type": "text", "text": text})
    messages = [
        {"role": "system", "content": [{"type": "text", "text": system_content}]}
    ] + [{"role": "user", "content": content_images}]
    response = call_openai.local(messages, max_tokens=6000, model="gpt-4o")

    return response

    

