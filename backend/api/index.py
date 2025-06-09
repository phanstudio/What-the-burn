# api/index.py
from myproject.wsgi import application  # or .asgi if using ASGI

from vercel_python.wsgi import run_wsgi_app

def handler(request, context):
    return run_wsgi_app(application, request, context)
