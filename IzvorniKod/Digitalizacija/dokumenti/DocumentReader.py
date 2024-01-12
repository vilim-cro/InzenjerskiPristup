import cv2
from PIL import Image
import pytesseract
import numpy as np
from sklearn.cluster import KMeans
from itertools import combinations

'''
Example of use:

import DocumentReader
from PIL import Image
image = Image.open("path/to/image/something.png") (path can be relative or apsolute)
err, text = DocumentReader.DocumentReader.readDocument(image)
'''

# https://medium.com/intelligentmachines/document-detection-in-python-2f9ffd26bf65
class DocumentChecker:
    def __init__(self, preprocessors, corner_detector):
        self._preprocessors = preprocessors
        self._corner_detector = corner_detector


    def __call__(self, inImage):
        # Step 1: Read image from file
        self.image = cv2.cvtColor(np.array(inImage), cv2.COLOR_RGB2BGR)
        self._image = Resizer()(self.image)
        # Step 2: Preprocess image
        self._processed = self._image
        for preprocessor in self._preprocessors:
            self._processed = preprocessor(self._processed)

        # Step 3: Find quadrilaterals or four corners of page
        self._intersections = self._corner_detector(self._processed)
        for point in self._intersections:
            cv2.circle(self._processed,(int(point[0][0]),int(point[0][1])),10,(127,127,127),-1)
        # cv2.imwrite('output/points.jpg',self._processed)
        ok = self.checkPoints(0.2, 0.4)
        if ok:
            return ok, self.extract_page()
        return ok, self._processed
    
    def checkPoints(self, thresh, cover):
        if (len(self._intersections) != 4):
            return False
        xs, ys = [point[0][0] for point in self._intersections],[point[0][1] for point in self._intersections]
        xs.sort()
        ys.sort()
        diff = 0
        for i in range(2):
            diff += abs(xs[i * 2] - xs[i * 2 + 1])
            diff += abs(ys[i * 2] - ys[i * 2 + 1])

        h,w = self._processed.shape
        P = abs(xs[1] - xs[2]) * abs(ys[1] - ys[2])
        return diff < thresh*max(w,h) and P/(h*w) > cover
    
    def extract_page(self):
        H0,W0 = self.image.shape[0],self.image.shape[1]
        H1,W1 = self._image.shape[0],self._image.shape[1]
        rh,rw = H0/H1,W0/W1
        pts = np.array([
            ((x-20) * rw, (y-20) * rh)
            for intersection in self._intersections
            for x, y in intersection
        ])
        rect = self._order_points(pts)
        (tl, tr, br, bl) = rect
        
        widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2)) 
        widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
        maxWidth = max(int(widthA), int(widthB))

        heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
        heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
        maxHeight = max(int(heightA), int(heightB))

        dst = np.array([
            [0, 0],                         # Top left point
            [maxWidth - 1, 0],              # Top right point
            [maxWidth - 1, maxHeight - 1],  # Bottom right point
            [0, maxHeight - 1]],            # Bottom left point
            dtype = "float32"               # Date type
        )

        M = cv2.getPerspectiveTransform(rect, dst)
        warped = cv2.warpPerspective(self.image, M, (maxWidth, maxHeight))

        # cv2.imwrite('output/warped.jpg', warped)

        return warped

    
    def _order_points(self, pts):
        rect = np.zeros((4, 2), dtype = "float32")
        s = pts.sum(axis = 1)
        rect[0] = pts[np.argmin(s)]
        rect[2] = pts[np.argmax(s)]

        diff = np.diff(pts, axis = 1)
        rect[1] = pts[np.argmin(diff)]
        rect[3] = pts[np.argmax(diff)]

        return rect


class FastDenoiser:
    "Denoises image by using the fastNlMeansDenoising method"
    def __init__(self, strength = 9):
        self._strength = strength


    def __call__(self, image):
        temp = cv2.fastNlMeansDenoising(image, h = self._strength)
        # cv2.imwrite('output/denoised.jpg', temp)
        return temp

class BWThresholder:
    def __init__(self, black = 0, white = 255, otsu = True):
        self.black = black
        self.white = white
        self.otsu = otsu


    def __call__(self, image):
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        T_, thresholded = cv2.threshold(image, self.black, self.white, cv2.THRESH_BINARY + (cv2.THRESH_OTSU if self.otsu else 0))
        # cv2.imwrite('output/thresholded.jpg', thresholded)
        return thresholded

class Bordering: 
    def __init__(self, padding = 20):
        self.padding = padding

    def __call__(self, image):
        boardered = cv2.copyMakeBorder(image,self.padding,self.padding,self.padding,self.padding,cv2.BORDER_CONSTANT,value= 0)
        # cv2.imwrite('output/border.jpg', boardered)
        return boardered

class CornerDetector:
    def __init__(self, rho_acc = 1, theta_acc = 180, thresh = 100, output_process = True):
        self.rho_acc = rho_acc
        self.theta_acc = theta_acc
        self.thresh = thresh
        self.output_process = output_process
        self._preprocessor = [
            Closer(output_process = output_process), 
            EdgeDetector(output_process = output_process)
        ]

    
    def __call__(self, image):
        # Step 1: Process for edge detection
        self._image = image
        for processor in self._preprocessor:
            self._image = processor(self._image)
        
        # Step 2: Get hough lines
        self._lines = self._get_hough_lines()

        # Step 3: Get intersection points
        try:   
            self._intersections = self._get_intersections()
        except:
            return []
        # Step 4: Get Quadrilaterals
        try:
            return self._find_quadrilaterals()
        except:
            return []
        
    def _get_hough_lines(self):
        lines = cv2.HoughLines(
            self._image, 
            self.rho_acc, 
            np.pi / self.theta_acc, 
            self.thresh
        )
        return lines
    
    def _get_intersections(self):
        lines = self._lines
        intersections = []
        group_lines = combinations(range(len(lines)), 2)
        x_in_range = lambda x: -10 <= x <= self._image.shape[1]+10
        y_in_range = lambda y: -10 <= y <= self._image.shape[0]+10

        for i, j in group_lines:
            line_i, line_j = lines[i][0], lines[j][0]

            if 80.0 < self._get_angle_between_lines(line_i, line_j) < 100.0:
                int_point = self._intersection(line_i, line_j)

                if x_in_range(int_point[0]) and y_in_range(int_point[1]): 
                    intersections.append(int_point)

        return intersections
        
    def _get_angle_between_lines(self, line_1, line_2):
        rho1, theta1 = line_1
        rho2, theta2 = line_2      
        # x * cos(theta) + y * sin(theta) = rho
        # y * sin(theta) = x * (- cos(theta)) + rho
        # y = x * (-cos(theta) / sin(theta)) + rho
        # m1 = -(np.cos(theta1) / np.sin(theta1))
        # m2 = -(np.cos(theta2) / np.sin(theta2))
        deltaTheta = abs(theta1 - theta2) * (180 / np.pi)
        return deltaTheta if (deltaTheta <= 180) else (180 - deltaTheta)
        # return abs(np.arctan(abs(m2-m1) / (1 + m2 * m1))) * (180 / np.pi)

        
    def _intersection(self, line1, line2):
        rho1, theta1 = line1
        rho2, theta2 = line2

        A = np.array([
        [np.cos(theta1), np.sin(theta1)],
        [np.cos(theta2), np.sin(theta2)]
        ])

        b = np.array([[rho1], [rho2]])
        x0, y0 = np.linalg.solve(A, b)
        x0, y0 = int(np.round(x0)), int(np.round(y0))
        return [x0, y0]
    
    def _find_quadrilaterals(self):
        X = np.array([[point[0], point[1]] for point in self._intersections])
        kmeans = KMeans(
            n_clusters = 4,
            init = 'k-means++', 
            max_iter = 100, 
            n_init = 10, 
            random_state = 0
        ).fit(X)

        return  [[center.tolist()] for center in kmeans.cluster_centers_]

class Closer:
    def __init__(self, kernel_size = 3, iterations = 10, output_process = False):
        self._kernel_size = kernel_size
        self._iterations = iterations
        self.output_process = output_process


    def __call__(self, image):
        kernel = cv2.getStructuringElement(
            cv2.MORPH_ELLIPSE, 
            (self._kernel_size, self._kernel_size)
        )
        closed = cv2.morphologyEx(
            image, 
            cv2.MORPH_CLOSE, 
            kernel,
            iterations = self._iterations
        )

        # if self.output_process: cv2.imwrite('output/closed.jpg', closed)
        return closed

class EdgeDetector:
    def __init__(self, output_process = False):
        self.output_process = output_process


    def __call__(self, image, thresh1 = 50, thresh2 = 150, apertureSize = 3):
        edges = cv2.Canny(image, thresh1, thresh2, apertureSize = apertureSize)
        # cv2.imwrite('output/edges.jpg', edges)
        return edges

class Resizer:
    def __init__(self, size = 900):
        self._size = size

    def __call__(self, InImage):
        # image = cv2.cvtColor(np.array(InImage), cv2.COLOR_RGB2BGR)
        image = InImage
        if image.shape[0] <= self._size and image.shape[1] <= self._size: return image
        if (image.shape[0] >= image.shape[1]):
            ratio = round(self._size / image.shape[0], 3)
            width = int(image.shape[1] * ratio)
            dim = (width, self._size)
        else:
            ratio = round(self._size / image.shape[1], 3)
            height = int(image.shape[0] * ratio)
            dim = (self._size, height)
        resized = cv2.resize(image, dim, interpolation = cv2.INTER_AREA) 
        # cv2.imwrite('output/resized.jpg', resized)
        # return Image.fromarray(cv2.cvtColor(resized, cv2.COLOR_BGR2RGB))
        return resized

def crop_edges(image):
    height, width = image.shape[0],image.shape[1]
    crop_percentage = 0.03
    crop_pixels_top = int(crop_percentage * height)
    crop_pixels_bottom = int(crop_percentage * height)
    crop_pixels_left = int(crop_percentage * width)
    crop_pixels_right = int(crop_percentage * width)
    cropped_image = image[crop_pixels_top:height-crop_pixels_bottom, crop_pixels_left:width-crop_pixels_right]
    return cropped_image

class DocumentReader:
    __config = r"--psm 6 --oem 3"
    _checker = DocumentChecker([FastDenoiser(), BWThresholder(),Bordering()],CornerDetector())
    _post = [FastDenoiser(3),BWThresholder(otsu=True)] #black=180,white=255 
    _resizer = Resizer()
    def readDocument(image: Image) -> (bool,str):
        pytesseract.pytesseract.tesseract_cmd = "/bin/tesseract"
        isRectangle,extracted = DocumentReader._checker(image)

        extracted = DocumentReader._resizer(extracted)
        if isRectangle: 
            for process in DocumentReader._post:
                extracted = process(extracted)
        extracted = crop_edges(extracted)
        resized = Image.fromarray(cv2.cvtColor(extracted, cv2.COLOR_BGR2RGB))
        # extracted.show()
        return isRectangle, pytesseract.image_to_string(resized, config=DocumentReader.__config, lang="hrv") if isRectangle else ''