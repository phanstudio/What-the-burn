# Generated by Django 5.1.6 on 2025-06-27 12:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('systems', '0007_rename_updated_update_request_downloaded_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='update_request',
            name='address',
            field=models.CharField(max_length=44),
        ),
        migrations.AlterField(
            model_name='update_request',
            name='transaction_hash',
            field=models.CharField(max_length=88, primary_key=True, serialize=False, unique=True),
        ),
    ]
