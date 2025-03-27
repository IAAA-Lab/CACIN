import subprocess
import time
from django.http import HttpResponse, JsonResponse
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from PIL import Image

from backend.workflow.alphabetSegmenter import getAlphabetSegmentation
from backend.serializers import ImageSerializer
from rest_framework.parsers import FileUploadParser
from rest_framework.views import APIView
from django.conf import settings
import os
from subprocess import run, CalledProcessError
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, FileResponse



from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import os
import time
import subprocess
from django.conf import settings
import tempfile
import shutil

@csrf_exempt
def upload_rdf(request):
    if request.method == 'POST':
        if 'rdf_file' not in request.FILES:
            return JsonResponse({'success': False, 'message': 'No RDF file provided.'}, status=400)
        
        rdf_file = request.FILES['rdf_file']
        
        # Verificar la extensión del archivo
        if not rdf_file.name.endswith('.rdf'):
            return JsonResponse({'success': False, 'message': 'Invalid file type. Only .rdf files are allowed.'}, status=400)
        
        # Generar el nombre de archivo con la marca de tiempo
        timestamp = int(time.time())
        new_file_name = f"rdf_{timestamp}.rdf"
        upload_path = os.path.join(settings.MEDIA_ROOT, 'rdf_files')
        os.makedirs(upload_path, exist_ok=True)
        file_path = os.path.join(upload_path, new_file_name)

        # Guardar el archivo RDF con el nuevo nombre
        with open(file_path, 'wb+') as destination:
            for chunk in rdf_file.chunks():
                destination.write(chunk)

        # Ruta del script `fill_db.py`
        script_path = '/home/hala/work/dec/reconocimiento-tipografias-incunabula2.0/incunabula/incunabulaBackend/fill_db.py'

        # Establecer el entorno de Django
        env = os.environ.copy()
        env['DJANGO_SETTINGS_MODULE'] = 'incunabulaBackend.settings'  # Reemplaza esto con el módulo de configuración correcto
        env['PYTHONPATH'] = os.path.join(settings.BASE_DIR, 'incunabulaBackend')  # Asegúrate de que apunta a tu proyecto

        # Ejecutar el script fill_db.py con el archivo RDF como argumento
        try:
            result = subprocess.run(
                ['python3', script_path, file_path],
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                universal_newlines=True,
                env=env
            )
            return JsonResponse({
                'success': True,
                'message': 'Base de datos actualizada con éxito.',
                'output': result.stdout
            })
        except subprocess.CalledProcessError as e:
            return JsonResponse({
                'success': False,
                'message': 'Error al ejecutar el script.',
                'error': e.stderr
            })

    return JsonResponse({'success': False, 'message': 'Invalid request method.'}, status=405)



@csrf_exempt
def export_rdf(request):
    if request.method == 'POST':
        script_path = '/home/hala/work/dec/reconocimiento-tipografias-incunabula2.0/incunabula/incunabulaBackend/export_db.py'

        # Crear un directorio temporal
        temp_dir = tempfile.mkdtemp()
        output_file = os.path.join(temp_dir, 'exported.rdf')
        static_file = "exported_data.rdf"  # Nombre fijo que utiliza el script export_db.py

        try:
            # Configurar entorno de Django
            env = os.environ.copy()
            env['DJANGO_SETTINGS_MODULE'] = 'incunabulaBackend.settings'
            env['PYTHONPATH'] = os.path.join(settings.BASE_DIR, 'incunabulaBackend')

            # Ejecutar el script export_db.py
            result = subprocess.run(
                ['python3', script_path],
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                universal_newlines=True,
                env=env
            )

            # Mover el archivo generado al directorio temporal
            static_path = os.path.join(os.getcwd(), static_file)
            if os.path.exists(static_path):
                shutil.move(static_path, output_file)
            else:
                return JsonResponse({'success': False, 'message': 'Archivo exportado no encontrado.'}, status=404)

            # Leer y devolver el archivo RDF
            with open(output_file, 'rb') as f:
                response = HttpResponse(f.read(), content_type='application/rdf+xml')
                response['Content-Disposition'] = f'attachment; filename="{os.path.basename(output_file)}"'
                return response

        except subprocess.CalledProcessError as e:
            return JsonResponse({
                'success': False,
                'message': 'Error al ejecutar el script.',
                'error': e.stderr
            }, status=500)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': 'Error inesperado.',
                'error': str(e)
            }, status=500)
        finally:
            # Eliminar el directorio temporal y su contenido
            shutil.rmtree(temp_dir)

    return JsonResponse({'success': False, 'message': 'Método no permitido.'}, status=405)


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
        #print(metadata)
        return Response(metadata, status=status.HTTP_200_OK)


