https://mycoachresume.com/

## Template used

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh



## Backend

I usually don't want to share my prompts to the real world. For that, I always write my backend server in python and only give a simple webserver endpoint schema to the frontend (I just upload an image, and I directly receive the recommendations)

1. Using modal.com (should take 1min to create a user)
2. Install modal with pip install modal-client
3. Auth issues:

   1. In the modal ui, create a secret for storing the auth for the project, and modify in the backend code `secrets=[modal.Secret.from_name("twitter")],`to point to the corresponding secret newly created
   2. add a `AUTH_TOKEN_RESUME` inside the token secrets
   3. Also add your OPENAI_API_KEY inside the token one
4. Write `modal deploy backend/main.py`
5. See the url that is being displayed and copy pasted that


## Frontend

1. Auth:
   1. add a .env file in the root directory, adding the `VITE_AUTH_TOKEN=AUTH_TOKEN_RESUME` where `AUTH_TOKEN_RESUME` is the same than the one used in the backend
2. Start the project locally
   1. npm run build
   2. npm run dev
   3. then visit the local url
3. Confirm it works locally!


## Deploy to vercel

I suggest deploying that to vercet. After you pushed that in your github repo, just create a project based on the github repo, and don't forget to add `VITE_AUTH_TOKEN` as an env variable inside the vercel project.




## Services available for Improving a Resume 
- We need a list of courses that the user should follow in order to be up to date in his field
- 