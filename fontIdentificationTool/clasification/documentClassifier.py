import os
import time

def classify_page(classifier, page_image_path, record_identifier=None, debug=False):

    # Initialize the classifier
    start_time = time.time()
    print("--- %s seconds ---" % (time.time() - start_time))

    # Process the page image
    if page_image_path:
        start_time = time.time()
        classifier.setImageToProcess(page_image_path)
        print("--- %s seconds ---" % (time.time() - start_time))
        classifier.segmentImage()
        classifier.identifyMs()
        fonts, resolution = classifier.getPageFontInformation()
        results = {
            'fonts': fonts,
            'resolution': resolution
        }
        print("--- %s seconds ---" % (time.time() - start_time))
    else:
        results = {}

    if record_identifier:
        start_time = time.time()
        fonts = classifier.getBookFontInformation(record_identifier)
        book_info = {'fonts': fonts}
        print("--- %s seconds ---" % (time.time() - start_time))
    else:
        book_info = {}

    if page_image_path and debug:
        classifier.savePageInfo(logDir, logDirMs)

    return results, book_info
