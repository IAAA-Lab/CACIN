from django.urls import path
from .views import BookView, OfficeView, FontTypeView, get_fontTypes_offices, login_user, create_user
from incunabula import views
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('api/books/', BookView.as_view(), name = 'book-list'),
    path('api/books/<str:pk>/', BookView.as_view(), name = 'book-detail'),

    path('api/offices/', OfficeView.as_view(), name = 'office-list'),
    path('api/offices/<str:pk>/', OfficeView.as_view(), name = 'office-detail'),
    path('api/offices-font/', get_fontTypes_offices),
    
    path('api/fontType/', FontTypeView.as_view(), name = 'fonttype-list'),
    path('api/fontType/<str:pk>/', FontTypeView.as_view(), name = 'fonttype-detail'),

    path('api/login/', login_user, name = 'login_user'),
    path('api/register/', create_user, name='create_user'),

    path("api/generate-upload-url/", views.generate_upload_url, name="generate_upload_url"),


    # Para una futura version
    # path('api/persons/', PersonView.as_view(), name = 'person-list'),
    # path('api/persons/<str:pk>/', PersonView.as_view(), name = 'person-detail'),
]

if settings.DEBUG:
    urlpatterns += static(settings.UPLOADS_URL, document_root=settings.UPLOADS_ROOT)
