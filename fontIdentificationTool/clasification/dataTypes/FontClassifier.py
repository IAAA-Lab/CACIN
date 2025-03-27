############################################################
#clase que busca en el fichero semantico la fuente apropiada dada la altura y tipo de m
############################################################
from rdflib import Graph

############################################################
############################################################
#clase que busca en el fichero semantico la fuente apropiada dada la altura y tipo de m
############################################################
class FontClassifier:
    #inicializa el identificador de las fuentes
    def __init__(self, semanticRepository):
        self.rdfGraph = Graph();
        self.rdfGraph.parse(semanticRepository, format="xml");

    #busca la fuente apropiada dada su altura y tipo de m
    def search_font(self, m_type, height, steps):
        result = [];  height = round(height);
        fonts = self.__search_font_query(m_type, str(height));
        if len(fonts) > 0:
            result = result + fonts;
        for i in range(1, steps + 1):
            fonts = self.__search_font_query(m_type, str(height - i));
            if len(fonts) > 0:
                result = result + fonts;
            fonts = self.__search_font_query(m_type, str(height + i));
            if len(fonts) > 0:
                result = result + fonts;
        return result;

    #vonsulta que busca la fuente con ciertas caracteristicas
    def __search_font_query(self, m_type, height):
        query = """
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX iaaa: <http://iaaa.es/incunabula#>
            SELECT ?font
            WHERE { ?font iaaa:shape ?m_type .
            ?font iaaa:height \"""" + str(height) + """\" .
            # ?font iaaa:validForTesting "true" .
            FILTER (?m_type=\"""" + str(m_type) + """\") }
        """
        results = self.rdfGraph.query(query);
        fonts = [];
        for result in results:
            fonts.append([str(result[0]), height, m_type]);
        return fonts;

    # dado un identificador de libro, devuelve la informacion de las fuentes
    def book_fonts(self, record_identifier):
        return self.__book_fonts_query(record_identifier);

    # consulta que busca las fuentes de un libro
    def __book_fonts_query(self, record_identifier):
        query ="""
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX iaaa: <http://iaaa.es/incunabula#>
            SELECT ?font ?height ?m
            WHERE { ?font iaaa:record ?book .
                ?book iaaa:recordIdentifier \"""" + str(record_identifier) + """\" .
                ?font iaaa:height ?height .
                ?font iaaa:shape ?m }
        """
        book_fonts = self.rdfGraph.query(query);
        fonts = [];
        for result in book_fonts:
            fonts.append([result[0], result[1], result[2]]);
        return fonts;

