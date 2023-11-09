# Generated by Django 4.2.6 on 2023-11-09 13:20

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('dokumenti', '0007_internidokument_potpisan_internidokument_potvrđen_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='internidokument',
            old_name='skeniraoKorisnik',
            new_name='korisnik',
        ),
        migrations.RenameField(
            model_name='nedefiniranidokument',
            old_name='skeniraoKorisnik',
            new_name='korisnik',
        ),
        migrations.RenameField(
            model_name='ponuda',
            old_name='skeniraoKorisnik',
            new_name='korisnik',
        ),
        migrations.RenameField(
            model_name='račun',
            old_name='skeniraoKorisnik',
            new_name='korisnik',
        ),
        migrations.RemoveField(
            model_name='internidokument',
            name='potpisan',
        ),
        migrations.RemoveField(
            model_name='internidokument',
            name='potvrđen',
        ),
        migrations.RemoveField(
            model_name='internidokument',
            name='pregledan',
        ),
        migrations.RemoveField(
            model_name='nedefiniranidokument',
            name='potpisan',
        ),
        migrations.RemoveField(
            model_name='nedefiniranidokument',
            name='potvrđen',
        ),
        migrations.RemoveField(
            model_name='nedefiniranidokument',
            name='pregledan',
        ),
        migrations.RemoveField(
            model_name='ponuda',
            name='potpisan',
        ),
        migrations.RemoveField(
            model_name='ponuda',
            name='potvrđen',
        ),
        migrations.RemoveField(
            model_name='ponuda',
            name='pregledan',
        ),
        migrations.RemoveField(
            model_name='račun',
            name='potpisan',
        ),
        migrations.RemoveField(
            model_name='račun',
            name='potvrđen',
        ),
        migrations.RemoveField(
            model_name='račun',
            name='pregledan',
        ),
        migrations.AddField(
            model_name='internidokument',
            name='direktor',
            field=models.ForeignKey(blank=True, limit_choices_to={'groups__name': 'Direktori'}, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)s_potpisao_dokument', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='internidokument',
            name='računovođa',
            field=models.ForeignKey(blank=True, limit_choices_to={'groups__name': 'Računovođe'}, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)s_pregledao_dokument', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='internidokument',
            name='revizor',
            field=models.ForeignKey(blank=True, limit_choices_to={'groups__name': 'Revizori'}, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)s_potvrdio_dokument', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='nedefiniranidokument',
            name='direktor',
            field=models.ForeignKey(blank=True, limit_choices_to={'groups__name': 'Direktori'}, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)s_potpisao_dokument', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='nedefiniranidokument',
            name='računovođa',
            field=models.ForeignKey(blank=True, limit_choices_to={'groups__name': 'Računovođe'}, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)s_pregledao_dokument', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='nedefiniranidokument',
            name='revizor',
            field=models.ForeignKey(blank=True, limit_choices_to={'groups__name': 'Revizori'}, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)s_potvrdio_dokument', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='ponuda',
            name='direktor',
            field=models.ForeignKey(blank=True, limit_choices_to={'groups__name': 'Direktori'}, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)s_potpisao_dokument', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='ponuda',
            name='računovođa',
            field=models.ForeignKey(blank=True, limit_choices_to={'groups__name': 'Računovođe'}, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)s_pregledao_dokument', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='ponuda',
            name='revizor',
            field=models.ForeignKey(blank=True, limit_choices_to={'groups__name': 'Revizori'}, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)s_potvrdio_dokument', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='račun',
            name='direktor',
            field=models.ForeignKey(blank=True, limit_choices_to={'groups__name': 'Direktori'}, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)s_potpisao_dokument', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='račun',
            name='računovođa',
            field=models.ForeignKey(blank=True, limit_choices_to={'groups__name': 'Računovođe'}, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)s_pregledao_dokument', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='račun',
            name='revizor',
            field=models.ForeignKey(blank=True, limit_choices_to={'groups__name': 'Revizori'}, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)s_potvrdio_dokument', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='internidokument',
            name='potpisaoDirektor',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='internidokument',
            name='potvrdioRevizor',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='internidokument',
            name='pregledaoRačunovođa',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='nedefiniranidokument',
            name='potpisaoDirektor',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='nedefiniranidokument',
            name='potvrdioRevizor',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='nedefiniranidokument',
            name='pregledaoRačunovođa',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='ponuda',
            name='potpisaoDirektor',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='ponuda',
            name='potvrdioRevizor',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='ponuda',
            name='pregledaoRačunovođa',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='račun',
            name='potpisaoDirektor',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='račun',
            name='potvrdioRevizor',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='račun',
            name='pregledaoRačunovođa',
            field=models.BooleanField(default=False),
        ),
    ]
