import os
from PIL import ImageDraw, Image
from clasification.dataTypes.CharClassifier import CharClassifier
from clasification.dataTypes.FontClassifier import FontClassifier
from clasification.dataTypes.ImageProcessor import ImageProcessor
from clasification.dataTypes.TextProcessor import TextProcessor

class PageClassifier:

    # Constructor that initializes the networks, structures, and loads support files
    def __init__(self, mDetectNetworkFile, mTypeDetectNetworkFile, trainingCollectionInputFile, semanticRepositoryFile):
        self.imageProc = ImageProcessor()
        self.textProc = TextProcessor()
        self.charClasiff = CharClassifier(mDetectNetworkFile, mTypeDetectNetworkFile, trainingCollectionInputFile)
        self.fontIdent = FontClassifier(semanticRepositoryFile)

    # Set the image to process
    def setImageToProcess(self, page_image_path):
        # Load the image and set the resolution in the processor
        self.page_image_path = page_image_path
        self.file_image = Image.open(page_image_path)
        self.ppi = self.imageProc.get_resolution(self.file_image)
        self.textProc.setImageResolution(self.ppi)

        # Clean the image
        self.file_image = self.imageProc.cleanImage(self.file_image)

        # Reset variables from the previous image (to avoid confusion during debugging)
        self.linesBB = None
        self.linesBlocks = None
        self.smallestLinesBlocks = None
        self.blocksInfo = None

    # Segment the image and define necessary blocks, lines, and characters
    def segmentImage(self):
        self.linesBB = self.textProc.getTextLines(self.file_image)
        self.linesBlocks = self.textProc.getTextBlocks(self.linesBB)
        self.smallestLinesBlocks = self.textProc.getSmallestBlocks(self.linesBlocks)  # change here
        self.blocksInfo = self.textProc.getBlockInfo(self.smallestLinesBlocks, self.ppi)
        self.blocksInfo = self.textProc.getCharsInBlocks(self.blocksInfo, self.file_image)

    # Identify the Ms and their types
    def identifyMs(self):
        self.blocksInfo, self.numChars = self.charClasiff.getBlockMs(self.blocksInfo)

    # Return the fonts found in the image
    def getPageFontInformation(self):
        result = []
        heights = []
        for idx, block in enumerate(self.blocksInfo):
            heights.append(block.proctorHeight)
            for mtype in block.mTypes:
                fontsInfo = self.fontIdent.search_font(mtype, block.proctorHeight, steps=2)
                for font in fontsInfo:
                    font.insert(0, idx)
                    result.append(font)
        return result, heights

    # Return the fonts of the book specified as a parameter
    def getBookFontInformation(self, record_identifier):
        return self.fontIdent.book_fonts(record_identifier)

    # Method to save information about a wrongly classified page
    def savePageInfoErr(self, dirPath, saveChars=False, saveMs=False, saveLines=False):
        # Get the file name to save the information and create the destination directory
        if not os.path.exists(dirPath):
            os.makedirs(dirPath)
        imgBaseName = os.path.splitext(os.path.basename(self.page_image_path))[0]

        # Save characters if requested
        if saveChars:
            img = self.file_image.convert("RGBA")
            img.save(dirPath + '/' + imgBaseName + '_page.tif')
            drw = ImageDraw.Draw(img)
            for block in self.blocksInfo:
                for char in block.charsPos:
                    drw.rectangle([(block.minX + char['x'], block.minY + char['y']),
                                   (block.minX + char['x'] + char['w'], block.minY + char['y'] + char['h'])],
                                  outline=(255, 0, 0, 255), width=2)
            img.save(dirPath + '/' + imgBaseName + '_pageChars.tif')

        # Save Ms if requested
        if saveMs:
            img = self.file_image.convert("RGBA")
            drw = ImageDraw.Draw(img)
            for block in self.blocksInfo:
                for m in block.mCharPos:
                    drw.rectangle([(block.minX + m['x'], block.minY + m['y']),
                                   (block.minX + m['x'] + m['w'], block.minY + m['y'] + m['h'])],
                                  outline=(255, 0, 0, 255), width=2)
            img.save(dirPath + '/' + imgBaseName + '_pageMChars.tif')
            img = self.file_image.convert("RGBA")
            drw = ImageDraw.Draw(img)
            for block in self.blocksInfo:
                for char in block.charsPos:
                    drw.rectangle([(block.minX + char['x'], block.minY + char['y']),
                                   (block.minX + char['x'] + char['w'], block.minY + char['y'] + char['h'])],
                                  outline=(255, 0, 0, 255), width=2)
            img.save(dirPath + '/' + imgBaseName + '_pageChars.tif')

        # Save lines if requested
        if saveLines:
            img = self.__drawBlockLine(self.file_image, self.linesBlocks)
            img.save(dirPath + '/' + imgBaseName + '_pageBlockLines.tif')

    # Method to save page information
    def savePageInfo(self, dirPath, dirPathMs):
        # Get the file name to save the information and create the destination directory
        if not os.path.exists(dirPath):
            os.makedirs(dirPath)
        imgBaseName = os.path.splitext(os.path.basename(self.page_image_path))[0]

        # Save the image with the recognized lines
        img = self.file_image.convert("RGBA")
        drw = ImageDraw.Draw(img)
        for line in self.linesBB:
            drw.rectangle([(line['x'], line['y']), (line['x'] + line['w'], line['y'] + line['h'])],
                          outline=(255, 0, 0, 255), width=2)
        img.save(dirPath + '/' + imgBaseName + '_pageLines.tif')

        # Save the found blocks as lines
        img = self.__drawBlockLine(self.file_image, self.linesBlocks)
        img.save(dirPath + '/' + imgBaseName + '_pageBlockLines.tif')

        # Save the bounding box of the blocks
        img = self.file_image.convert("RGBA")
        drw = ImageDraw.Draw(img)
        for block in self.blocksInfo:
            drw.rectangle([(block.minX, block.minY), (block.maxX, block.maxY)],
                          outline=(255, 0, 0, 255), width=2)
        img.save(dirPath + '/' + imgBaseName + '_pageSelBlocks.tif')

        # Save the segmented characters
        img = self.file_image.convert("RGBA")
        drw = ImageDraw.Draw(img)
        for block in self.blocksInfo:
            for char in block.charsPos:
                drw.rectangle([(block.minX + char['x'], block.minY + char['y']),
                               (block.minX + char['x'] + char['w'], block.minY + char['y'] + char['h'])],
                              outline=(255, 0, 0, 255), width=2)
        img.save(dirPath + '/' + imgBaseName + '_pageChars.tif')

        # Save the segmented characters that are M
        img = self.file_image.convert("RGBA")
        drw = ImageDraw.Draw(img)
        for block in self.blocksInfo:
            for m in block.mCharPos:
                drw.rectangle([(block.minX + m['x'], block.minY + m['y']),
                               (block.minX + m['x'] + m['w'], block.minY + m['y'] + m['h'])],
                              outline=(255, 0, 0, 255), width=2)
        img.save(dirPath + '/' + imgBaseName + '_pageMChars.tif')

        # Save the images of the segmented Ms
        for block in self.blocksInfo:
            for idx, m in enumerate(block.ms):
                m.save(dirPathMs + '/' + imgBaseName + '_M_' + str(idx) + '.tif')

        # Save the classification of the found Ms
        with open(dirPath + '/' + imgBaseName + '_pageMTypes.txt', "w") as text_file:
            for i, block in enumerate(self.blocksInfo):
                text_file.write("Block: %s, Height %s \n" % (i, block.proctorHeight))
                for idx, type in enumerate(block.mTypes):
                    text_file.write("Block: %s, Pos (%s, %s), Type %s \n" % (i, block.minX + block.mCharPos[idx]['x'], block.minY + block.mCharPos[idx]['y'], type))

    # Draw the line blocks in an image
    def __drawBlockLine(self, fileImg, linesBlocks):
        img = fileImg.convert("RGBA")
        drw = ImageDraw.Draw(img)
        color = [(255, 0, 0, 255), (0, 255, 0, 255), (0, 0, 255, 255)]
        for idx, block in enumerate(linesBlocks):
            for line in block:
                drw.rectangle([(line['x'], line['y']), (line['x'] + line['w'], line['y'] + line['h'])],
                              outline=color[idx % 3], width=2)
        return img
