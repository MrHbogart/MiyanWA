from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('miyanBeresht', '0003_alter_bereshtmenu_show_images'),
    ]

    operations = [
        migrations.AddField(
            model_name='bereshtmenusection',
            name='is_main_section',
            field=models.BooleanField(
                default=True,
                help_text='Mark false for side item groupings like add-ons or syrups.',
                verbose_name='Is Main Section',
            ),
        ),
    ]
