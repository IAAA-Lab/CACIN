from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.contrib.auth.hashers import make_password

# User model
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        
        if password:
            user.password = make_password(password)  # Encripta la contraseña
        
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser):
    username = models.CharField(max_length=25, unique=True)
    email = models.EmailField(max_length=50, unique=True)
    password = models.CharField(max_length=128)  # Usa 128 para los hashes más largos
    role = models.IntegerField(choices=[(0, 'Expert'), (1, 'Normal User')])
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()  # Asegúrate de que CustomUserManager esté definido

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

    
# FontType model
class FontType(models.Model):
    id = models.CharField(max_length=25, primary_key=True)
    height = models.IntegerField()
    mShape = models.CharField(max_length=15)
    alphabetImage = models.CharField(max_length=100,blank=True, null=True)
    officeID = models.ForeignKey('Office', on_delete=models.CASCADE, related_name='fontTypes')

# Book model
class Book(models.Model):
    id = models.CharField(max_length=25, primary_key=True)
    title = models.CharField(max_length=255, blank=True, null=True)
    creator = models.CharField(max_length=250, blank=True, null=True)
    publisher = models.CharField(max_length=250, blank=True, null=True)
    location = models.CharField(max_length=250, blank=True, null=True)
    printingOffice = models.ForeignKey('Office', on_delete=models.CASCADE, related_name='books', blank=True, null=True)
    date = models.IntegerField(blank=True, null=True)
    file = models.CharField(max_length=250, blank=True, null=True)

# Office model
class Office(models.Model):
    id = models.CharField(max_length=25, primary_key=True)
    officeName = models.CharField(max_length=255)
    alternativeName = models.CharField(max_length=255, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    foundedYear = models.IntegerField(blank=True, null=True)
    closedYear = models.IntegerField(blank=True, null=True)



# Relationships
class FontTypeBook(models.Model):
    fontTypeID = models.ForeignKey('FontType', on_delete=models.CASCADE, related_name='books')
    bookID = models.ForeignKey('Book', on_delete=models.CASCADE, related_name='fontTypes')

    class Meta:
        unique_together = ('fontTypeID', 'bookID')


#Para una futura version

# Person model
# class Person(models.Model):
#     id = models.CharField(max_length=25, primary_key=True)
#     role = models.CharField(max_length=10, choices=[('creator', 'Creator'), ('printer', 'Printer')])  # Usa `choices`
#     fullName = models.CharField(max_length=50, null=True, blank=True)

# class OfficePerson(models.Model):
#     officeID = models.ForeignKey('Office', on_delete=models.CASCADE, related_name='people_association')
#     personID = models.ForeignKey('Person', on_delete=models.CASCADE, related_name='office_association')

#     class Meta:
#         unique_together = ('officeID', 'personID')
