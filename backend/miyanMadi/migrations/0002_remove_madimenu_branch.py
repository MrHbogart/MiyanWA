from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('miyanMadi', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='madimenu',
            name='branch',
        ),
    ]
