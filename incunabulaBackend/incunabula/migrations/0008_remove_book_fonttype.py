# Generated by Django 3.2.20 on 2024-08-20 15:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('incunabula', '0007_alter_fonttype_alphabetimage'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='book',
            name='fontType',
        ),
    ]
