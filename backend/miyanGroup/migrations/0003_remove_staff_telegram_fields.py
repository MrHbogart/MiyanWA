from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('miyanGroup', '0002_seed_branches'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='staff',
            name='language_preference',
        ),
        migrations.RemoveField(
            model_name='staff',
            name='telegram_id',
        ),
        migrations.RemoveField(
            model_name='staff',
            name='telegram_token',
        ),
    ]
