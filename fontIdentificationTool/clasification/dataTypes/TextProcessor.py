##################################################################
# Clase con metodos para procesar el texto en una imagen
##################################################################
# noinspection PyUnresolvedReferences
from PIL import ImageShow
# from PIL._imaging import display
from tesserocr import PyTessBaseAPI, RIL
from clasification.dataTypes.TextBlock import TextBlock


##################################################################
##################################################################
# Clase con metodos para procesar el texto en una imagen
##################################################################
class TextProcessor:
    # constructor que inicializa tesseract
    def __init__(self):
        self.tesAPI = PyTessBaseAPI();

    # configura la resolución para el procesamiento de la página
    def setImageResolution(self, ppi, offset=5.5):
        self.ppi = ppi;
        self.px_max_width_diff = (offset * ppi) / 25.4;
        self.px_max_height_diff = (offset * ppi) / 25.4;
        self.px_max_start_col_diff = (offset * ppi) / 25.4;
        self.px_max_line_gap = (offset * ppi) / 25.4;

    # Obtiene todas las lineas de texto de un libro en formato TIF.
    # devuelve un dict con x, y, w, h
    def getTextLines(self, file_image):
        self.tesAPI.SetImage(file_image);
        self.tesAPI.SetSourceResolution(self.ppi);  # Optional
        return list(o[1] for o in self.tesAPI.GetComponentImages(RIL.TEXTLINE, True));

    # Obtiene un bloque del número de lineas válidas dado a partir de la primera linea.
    # devuelve lista de
    def getTextBlocks(self, lines):
        # miramos cada lina a ver si es compatible con la siguiente
        i = 0;
        blocks = [];
        while i < len(lines):
            block = [lines[i]];
            last_line = lines[i];
            i = i + 1;
            for line in lines[i:]:
                if not (abs(last_line["w"] - line["w"]) > self.px_max_width_diff or abs(
                        last_line["h"] - line["h"]) > self.px_max_height_diff or \
                        abs(last_line["x"] - line["x"]) > self.px_max_start_col_diff or (
                                last_line["y"] + last_line["h"] - line["y"]) > self.px_max_line_gap):
                    block.append(line);
                    last_line = line;
                    i = i + 1;
                else:
                    break
            blocks.append(block);
        return blocks

    # se queda con los bloques de mayor tamaño. 20 . 10 . 5
    def getBiggestBlocks(self, blocks):
        maxSize = len(max(blocks, key=lambda block: len(block)));
        if (maxSize >= 20):
            maxSize = 20;
        elif (maxSize >= 10):
            maxSize = 10;
        else:
            maxSize = 5;
        return [block for block in blocks if len(block) >= maxSize];

    def getSmallestBlocks(self, blocks):
        minSize = len(min(blocks, key=lambda block: len(block)))
        if minSize <= 5:
            minSize = 5
        return [block for block in blocks if len(block) >= minSize]

    # Mide el espacio que ocupa, en píxeles, un bloque.
    # tiene un defecto. El ajuste, primera, ultima linea no es el mejor
    def getBlockInfo(self, blocks, ppi):
        blocksInfo = [];
        for block in blocks:
            minX = 9999;
            minY = 9999;
            maxX = 0;
            maxY = 0;
            for i in range(0, len(block)):
                if block[i]["x"] < minX:
                    minX = block[i]["x"];
                if block[i]["y"] < minY:
                    minY = block[i]["y"];
                if (block[i]["x"] + block[i]["w"]) > maxX:
                    maxX = block[i]["x"] + block[i]["w"];
                if (block[i]["y"] + block[i]["h"]) > maxY:
                    maxY = block[i]["y"] + block[i]["h"];
            blocksInfo.append(TextBlock(minX, minY, maxX, maxY, len(block), ppi));
        return blocksInfo;

    # obtenemos los caracteres de cada bloque de texto
    def getCharsInBlocks(self, blocksInfo, file_image):
        for blockIn in blocksInfo:
            blockIn.chars = [];
            blockIn.charsPos = [];
            image = file_image.crop((blockIn.minX, blockIn.minY, blockIn.maxX, blockIn.maxY));
            self.tesAPI.SetImage(image);
            for char in self.tesAPI.GetComponentImages(RIL.SYMBOL,
                                                       True):  # sacamos el modo 1 recortando la imagen original de acuerdo a los bb indicados
                blockIn.chars.append(
                    image.crop((char[1]["x"], char[1]["y"], char[1]["x"] + char[1]["w"], char[1]["y"] + char[1]["h"])))
                blockIn.charsPos.append(char[1]);
        return blocksInfo;