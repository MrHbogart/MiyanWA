from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('miyanBeresht', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='bereshtmenu',
            name='branch',
        ),
    ]
