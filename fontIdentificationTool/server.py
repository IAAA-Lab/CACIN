from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import traceback
import logging
from clasification import documentClassifier
from clasification.dataTypes.PageClassifier import PageClassifier
import tensorflow as tf
from keras.backend import clear_session
import time
import threading

# Configure Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure temporary directory exists
TEMP_DIR = '/tmp'
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

# Global variables for TensorFlow session and graph
sess = None
graph = None
classifier = None
sem = threading.Semaphore(1)

def initialize_model():
    """Initialize the TensorFlow session, graph and model"""
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

    global sess, graph, classifier
    
    # Clear any existing sessions
    clear_session()
    
    # Create new session and graph
    sess = tf.Session()
    graph = tf.get_default_graph()
    
    # Make the session the default
    with sess.as_default():
        with graph.as_default():
            # Load model configuration
            workingDir = os.getenv('WORKING_DIR', '/app')
            model = os.getenv('MODEL', 'neuronal-network_small')
            
            mDetectNetworkFile = os.path.join(workingDir, f"data/output/{model}/mDetectorfixedConvWithSize_1000_50_4_Network.h5")
            mTypeDetectNetworkFile = os.path.join(workingDir, f"data/output/{model}/mTypeDetectorfixedConv_1000_200_4_Network.h5")
            trainingCollectionInputFile = os.path.join(workingDir, f"data/output/{model}/trainCollectionMTypeDetector.bin")
            semanticRepositoryFile = os.path.join(workingDir, f"data/output/{model}/incunZaguanRDFRepository.rdf")
            
            # Initialize classifier within the session/graph context
            classifier = PageClassifier(mDetectNetworkFile, mTypeDetectNetworkFile, 
                                     trainingCollectionInputFile, semanticRepositoryFile)

# Initialize the model when starting the server
initialize_model()

@app.route('/classify', methods=['POST'])
def classify():
    try:
        if 'file' not in request.files:
            logger.error("No file part in the request")
            return jsonify({'status': 'error', 'message': 'No file part in the request'}), 400

        file = request.files['file']
        if file.filename == '':
            logger.error("No selected file")
            return jsonify({'status': 'error', 'message': 'No selected file'}), 400

        if file:
            filepath = os.path.join(TEMP_DIR, file.filename)
            file.save(filepath)
            logger.info(f"File saved to {filepath}")

            # Use the global session and graph
            sem.acquire()
            with sess.as_default():
                with graph.as_default():
                    results, book_info = documentClassifier.classify_page(classifier, filepath, None, False)
                    sem.release()
                    logger.info(f"Classification results: {results}")
                    return jsonify({
                        'status': 'success',
                        'results': results,
                        'book_info': book_info
                    })

    except Exception as e:
        logger.error(f"An error occurred: {traceback.format_exc()}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    # Set TensorFlow logging level
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    
    # Run the Flask app
    app.run(host="x.x.x.x", port=xxxx)
