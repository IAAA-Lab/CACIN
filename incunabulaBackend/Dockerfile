# Base image
FROM python:3.6-slim

# Set working directory
WORKDIR /app

# Install system dependencies for psycopg2 and other packages
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    g++ \
    make \
    wget \
    tesseract-ocr \
    libtesseract-dev \
    libleptonica-dev \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --upgrade pip

# Copy requirements and install
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install django-environ
# Modify the line in the backend.py file using sed
RUN sed -i 's/return token.decode('\''utf-8'\'')/return token/' /usr/local/lib/python3.6/site-packages/rest_framework_simplejwt/backends.py
# Copy the application code
COPY . /app

# Expose the port for the server
EXPOSE xxxx

# Default command
CMD ["python", "manage.py", "runserver", "x.x.x.x:xxxx"]
