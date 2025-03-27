###########################################################
# clase pra almacenar los bloques de texto detectados
###########################################################
class TextBlock:
    def __init__(self, minX, minY, maxX, maxY, lines, ppi):
        self.minX = minX; self.minY = minY; self.maxX = maxX;
        self.maxY = maxY; self.lines = lines;
        self.proctorHeight = ((maxY - minY) / ppi * 25.4) / lines * 20;
        self.ms = []; self.mTypes = []; self.mCharPos = []