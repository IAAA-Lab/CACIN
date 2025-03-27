# Use a base image with Python 3.6
FROM python:3.6-slim

# Install Tesseract and OpenCV dependencies
RUN apt-get update && apt-get install -y \
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

RUN python -m pip install --upgrade pip

# Install Python dependencies
COPY requirements_classify.txt /app/
RUN pip install --no-cache-dir -r /app/requirements_classify.txt

# Copy the rest of your application code into the container
COPY . /app/

# Set the working directory
WORKDIR /app

# Set the PYTHONPATH environment variable
ENV PYTHONPATH="/app/clasification"

# Expose port xxxx for the application
EXPOSE xxxx

# Start the application (replace with your app's start command if different)
CMD ["python", "server.py"]
