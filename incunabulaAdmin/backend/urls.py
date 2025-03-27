from . import views
from django.conf.urls import url
from django.views.generic import TemplateView

urlpatterns = [
    url(r'api/swagger', TemplateView.as_view(template_name="swagger.html")),
    url(r'api/segmentAlphabet/', views.SegmentAlphabetView.as_view()),
    #url(r'^$', TemplateView.as_view(template_name="index.html")),
    url(r'api/upload_rdf/', views.upload_rdf, name='upload_rdf'),
    url(r'api/export/', views.export_rdf, name='export_rdf'),

]
