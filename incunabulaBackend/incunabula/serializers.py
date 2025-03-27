from rest_framework import serializers
from .models import Book, FontType, Office, User
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['username', 'email', 'password', 'role']
        extra_kwargs = {
            'password': {'write_only': True},  # La contraseña solo debe ser usada en la creación
        }

    def create(self, validated_data):
        # Encripta la contraseña antes de crear el usuario
        validated_data['password'] = make_password(validated_data['password'])
        return super(UserSerializer, self).create(validated_data)

class FontTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FontType
        fields = '__all__'

class OfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Office
        fields = '__all__'

class BookSerializer(serializers.ModelSerializer):
    fontTypes = serializers.SerializerMethodField()
    printingOffice = serializers.PrimaryKeyRelatedField(queryset=Office.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Book
        fields = '__all__'

    def get_fontTypes(self, obj):
        # Filtrar FontTypes usando la relación many-to-many en FontTypeBook
        fontTypes = FontType.objects.filter(books__bookID=obj.id)
        return FontTypeSerializer(fontTypes, many=True).data

    def to_representation(self, instance):
        
        ret = super().to_representation(instance)
        if instance.printingOffice:
            ret['printingOffice'] = OfficeSerializer(instance.printingOffice).data
        return ret

# Para una futura versión
# class PersonSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Person
#         fields = '__all__'