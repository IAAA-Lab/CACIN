"""mysite URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls import url
from rest_framework_swagger.views import get_swagger_view
from django.urls import include, path
from rest_framework.documentation import include_docs_urls
from django.conf.urls.static import static
from mysite import settings


API_TITLE = 'Incunabula API'
API_DESCRIPTION = 'A Web API for Incunabula Font Recognition.'

urlpatterns = [
    url(r'^', include('backend.urls')),
    #url(r'^$', get_swagger_view(title=API_TITLE)),
    #url(r'^docs/', include_docs_urls(title=API_TITLE, description=API_DESCRIPTION)),
]+ static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


