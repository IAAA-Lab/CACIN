from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from PIL import Image

from alphabetSegmenter import getAlphabetSegmentation
from manualCharClasif.serializers import ImageSerializer

#Vista que recibe peticiones post con imagen de un alfabeto y nombre de la fuente y devuelve un metadato
#con un RDF con la posición de las letras en dicho alfabeto

class SegmentAlphabetView(GenericAPIView):
    # necesarios para procesar el modelo enviado y para crear el api apropiado
    serializer_class = ImageSerializer
    parser_classes = (FormParser, MultiPartParser)

    #funcion de post que recibe una imagen y devuelve metadatos de lugar letras de dicha imagen
    def post(self, request, *args, **kwargs):
        serializer = ImageSerializer(data=request.data)
        if serializer.is_valid() is False:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        content = serializer.validated_data['file']
        pil_image_obj = Image.open(content.file)
        metadata = getAlphabetSegmentation(pil_image_obj, content.name)
        print(metadata)
        return Response(metadata, status=status.HTTP_200_OK)


