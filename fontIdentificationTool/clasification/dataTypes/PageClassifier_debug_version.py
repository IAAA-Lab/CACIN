import os
import logging
from PIL import ImageDraw, Image
from clasification.dataTypes.CharClassifier import CharClassifier
from clasification.dataTypes.FontClassifier import FontClassifier
from clasification.dataTypes.ImageProcessor import ImageProcessor
from clasification.dataTypes.TextProcessor import TextProcessor

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

class PageClassifier:
    def __init__(self, mDetectNetworkFile, mTypeDetectNetworkFile, trainingCollectionInputFile, semanticRepositoryFile):
        self.imageProc = ImageProcessor()
        self.textProc = TextProcessor()
        self.charClasiff = CharClassifier(mDetectNetworkFile, mTypeDetectNetworkFile, trainingCollectionInputFile)
        self.fontIdent = FontClassifier(semanticRepositoryFile)
        logging.debug('PageClassifier initialized with networks and support files.')

    def setImageToProcess(self, page_image_path):
        logging.debug(f'Setting image to process: {page_image_path}')
        self.page_image_path = page_image_path
        self.file_image = Image.open(page_image_path)
        self.ppi = self.imageProc.get_resolution(self.file_image)
        logging.debug(f'Image resolution set to {self.ppi} PPI.')
        self.textProc.setImageResolution(self.ppi)

        self.file_image = self.imageProc.cleanImage(self.file_image)
        logging.debug('Image cleaned.')

        self.linesBB = None
        self.linesBlocks = None
        self.blocksInfo = None
        logging.debug('Previous image variables reset.')

    def segmentImage(self):
        logging.debug('Segmenting image into lines and blocks.')
        self.linesBB = self.textProc.getTextLines(self.file_image)
        self.linesBlocks = self.textProc.getTextBlocks(self.linesBB)
        logging.debug(f'Detected {len(self.linesBlocks)} text blocks.')

        self.blocksInfo = self.textProc.getBlockInfo(self.linesBlocks, self.ppi)
        self.blocksInfo = self.textProc.getCharsInBlocks(self.blocksInfo, self.file_image)
        logging.debug(f'Character positions identified in {len(self.blocksInfo)} blocks.')

    def identifyMs(self):
        logging.debug('Identifying Ms and their types.')
        self.blocksInfo, self.numChars = self.charClasiff.getBlockMs(self.blocksInfo)
        logging.debug(f'Identified {self.numChars} characters classified as M.')

    def getPageFontInformation(self):
        result = []
        heights = []
        logging.debug('Getting font information for the page.')
        for idx, block in enumerate(self.blocksInfo):
            heights.append(block.proctorHeight)
            logging.debug(f'Block {idx} with height {block.proctorHeight}')
            for mtype in block.mTypes:
                fontsInfo = self.fontIdent.search_font(mtype, block.proctorHeight, steps=2)
                for font in fontsInfo:
                    font.insert(0, idx)
                    result.append(font)
        return result, heights

    def getBookFontInformation(self, record_identifier):
        logging.debug(f'Getting font information for book: {record_identifier}')
        return self.fontIdent.book_fonts(record_identifier)

    def savePageInfoErr(self, dirPath, saveChars=False, saveMs=False, saveLines=False):
        logging.debug(f'Saving error page information to: {dirPath}')
        if not os.path.exists(dirPath):
            os.makedirs(dirPath)
        
        imgBaseName = os.path.splitext(os.path.basename(self.page_image_path))[0]

        if saveChars:
            img = self.file_image.convert("RGBA")
            img.save(dirPath + '/' + imgBaseName + '_page.tif')
            drw = ImageDraw.Draw(img)
            for block in self.blocksInfo:
                for char in block.charsPos:
                    drw.rectangle([(block.minX + char['x'], block.minY + char['y']), (block.minX + char['x'] + char['w'], block.minY + char['y'] + char['h'])], outline=(255, 0, 0, 255), width=2)
            img.save(dirPath + '/' + imgBaseName + '_pageChars.tif')
            logging.debug(f'Saved characters information for {imgBaseName}.')

        if saveMs:
            img = self.file_image.convert("RGBA")
            drw = ImageDraw.Draw(img)
            for block in self.blocksInfo:
                for m in block.mCharPos:
                    drw.rectangle([(block.minX + m['x'], block.minY + m['y']), (block.minX + m['x'] + m['w'], block.minY + m['y'] + m['h'])], outline=(255, 0, 0, 255), width=2)
            img.save(dirPath + '/' + imgBaseName + '_pageMChars.tif')
            img = self.file_image.convert("RGBA")
            drw = ImageDraw.Draw(img)
            for block in self.blocksInfo:
                for char in block.charsPos:
                    drw.rectangle([(block.minX + char['x'], block.minY + char['y']), (block.minX + char['x'] + char['w'], block.minY + char['y'] + char['h'])], outline=(255, 0, 0, 255), width=2)
            img.save(dirPath + '/' + imgBaseName + '_pageChars.tif')
            logging.debug(f'Saved Ms and characters information for {imgBaseName}.')

        if saveLines:
            img = self.__drawBlockLine(self.file_image, self.linesBlocks)
            img.save(dirPath + '/' + imgBaseName + '_pageBlockLines.tif')
            logging.debug(f'Saved lines information for {imgBaseName}.')

    def savePageInfo(self, dirPath, dirPathMs):
        logging.debug(f'Saving page information to: {dirPath} and Ms to {dirPathMs}')
        if not os.path.exists(dirPath):
            os.makedirs(dirPath)
        
        imgBaseName = os.path.splitext(os.path.basename(self.page_image_path))[0]

        img = self.file_image.convert("RGBA")
        drw = ImageDraw.Draw(img)
        for line in self.linesBB:
            drw.rectangle([(line['x'], line['y']), (line['x'] + line['w'], line['y'] + line['h'])], outline=(255, 0, 0, 255), width=2)
        img.save(dirPath + '/' + imgBaseName + '_pageLines.tif')

        img = self.__drawBlockLine(self.file_image, self.linesBlocks)
        img.save(dirPath + '/' + imgBaseName + '_pageBlockLines.tif')

        img = self.file_image.convert("RGBA")
        drw = ImageDraw.Draw(img)
        for block in self.blocksInfo:
            drw.rectangle([(block.minX, block.minY), (block.maxX, block.maxY)], outline=(255, 0, 0, 255), width=2)
        img.save(dirPath + '/' + imgBaseName + '_pageSelBlocks.tif')

        img = self.file_image.convert("RGBA")
        drw = ImageDraw.Draw(img)
        for block in self.blocksInfo:
            for char in block.charsPos:
                drw.rectangle([(block.minX + char['x'], block.minY + char['y']), (block.minX + char['x'] + char['w'], block.minY + char['y'] + char['h'])], outline=(255, 0, 0, 255), width=2)
        img.save(dirPath + '/' + imgBaseName + '_pageChars.tif')

        img = self.file_image.convert("RGBA")
        drw = ImageDraw.Draw(img)
        for block in self.blocksInfo:
            for m in block.mCharPos:
                drw.rectangle([(block.minX + m['x'], block.minY + m['y']), (block.minX + m['x'] + m['w'], block.minY + m['y'] + m['h'])], outline=(255, 0, 0, 255), width=2)
        img.save(dirPath + '/' + imgBaseName + '_pageMChars.tif')

        for block in self.blocksInfo:
            for idx, m in enumerate(block.ms):
                m.save(dirPathMs + '/' + imgBaseName + '_M_' + str(idx) + '.tif')

        with open(dirPath + '/' + imgBaseName + '_pageMTypes.txt', "w") as text_file:
            for i, block in enumerate(self.blocksInfo):
                text_file.write(f"Block: {i}, Height {block.proctorHeight}\n")
                for idx, type in enumerate(block.mTypes):
                    text_file.write(f"Block: {i}, Pos ({block.minX + block.mCharPos[idx]['x']}, {block.minY + block.mCharPos[idx]['y']}), Type {type}\n")
        logging.debug(f'Page information saved for {imgBaseName}.')

    def __drawBlockLine(self, fileImg, linesBlocks):
        logging.debug('Drawing block lines on the image.')
        img = fileImg.convert("RGBA")
        drw = ImageDraw.Draw(img)
        color = [(255, 0, 0, 255), (0, 255, 0, 255), (0, 0, 255, 255)]
        for idx, block in enumerate(linesBlocks):
            for line in block:
                drw.rectangle([(line['x'], line['y']), (line['x'] + line['w'], line['y'] + line['h'])], outline=color[idx % 3], width=2)
        return img

