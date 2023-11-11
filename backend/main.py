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


app_image = (
    modal.Image.debian_slim().pip_install("openai==1.1.1","numpy","Pillow",)
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

`A` => `B`
Explanation..

`C` => `D`
Explanation..

## Grade per sections

1. `Section 1 name`: 5/10
Explanation..

...

## What to learn and add to the resume
Description of things candidate should learn to improve the overal content of the resume (not the form, but actually cool project to shine)
```
...

Then, grade each part of the resume
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
                print(chunk_message)
                yield chunk_message
    except Exception as e:
        print(e)
        # yield error message
        yield str(e)
    


@stub.function()
@web_endpoint(
    method="POST",
)
def review_resume(image: UploadFile):
    # only review the image of the file - TODO later on take care of PDF
    import base64
    image_bytes = image.file.read()
    base64_img = base64.b64encode(image_bytes).decode("utf-8")
    print(f"Image size: {len(base64_img)}")
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

    


def test_review_resume():
    # create a fake image using numpy
    import base64

    import numpy as np
    from PIL import Image
    img = Image.fromarray(np.zeros((100, 100, 3), dtype=np.uint8))
    img_bas64 = base64.b64encode(img.tobytes()).decode("utf-8")
    response = review_resume.local(image=img_bas64)
    print(response)