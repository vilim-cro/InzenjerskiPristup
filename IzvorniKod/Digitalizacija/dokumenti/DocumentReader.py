import cv2
from PIL import Image
import pytesseract

class DocumentReader:
    __config = r"--psm 3--oem 3"
    def readDocument(image: Image) -> str:
        pytesseract.pytesseract.tesseract_cmd = "dokumenti/OCR_DATA/TESS/tesseract"
        return pytesseract.image_to_string(image, config=DocumentReader.__config, lang="hrv")


'''
Example of use:

import DocumentReader
from PIL import Image
image = Image.open("path/to/image/something.png") (path can be relative or apsolute)
text = DocumentReader.DocumentReader.readDocument(image)
'''