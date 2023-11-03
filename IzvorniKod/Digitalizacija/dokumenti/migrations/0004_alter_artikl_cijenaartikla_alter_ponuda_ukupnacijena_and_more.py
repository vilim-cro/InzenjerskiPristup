# Generated by Django 4.0.3 on 2023-11-03 11:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dokumenti', '0003_alter_specijalizacijaračunovođe_korisnik'),
    ]

    operations = [
        migrations.AlterField(
            model_name='artikl',
            name='cijenaArtikla',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AlterField(
            model_name='ponuda',
            name='ukupnaCijena',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AlterField(
            model_name='račun',
            name='ukupnaCijena',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
    ]
