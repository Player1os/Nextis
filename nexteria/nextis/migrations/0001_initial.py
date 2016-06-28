# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-05-15 21:18
from __future__ import unicode_literals

import ckeditor.fields
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('skolne', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='BuddyVztah',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('zaciatok', models.DateField()),
                ('koniec', models.DateField()),
            ],
            options={
                'verbose_name_plural': '  Buddy Vztahy',
            },
        ),
        migrations.CreateModel(
            name='Clovek',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('meno', models.CharField(max_length=100)),
                ('priezvisko', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('telefon_cislo', models.CharField(blank=True, max_length=25, validators=[django.core.validators.RegexValidator(message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.", regex='^\\+?1?\\d{9,15}$')])),
            ],
            options={
                'verbose_name_plural': '   Ludia',
            },
        ),
        migrations.CreateModel(
            name='Fakulta',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nazov', models.CharField(max_length=100)),
                ('skratka', models.CharField(max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='GuideVztah',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('zaciatok', models.DateField()),
                ('koniec', models.DateField()),
                ('mentor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='nextis.Clovek')),
            ],
            options={
                'verbose_name_plural': '  Guide Vztahy',
            },
        ),
        migrations.CreateModel(
            name='Level',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('stav', models.CharField(choices=[('1', '1'), ('2', '2'), ('3', '3'), ('alumni', 'alumni')], max_length=6)),
                ('zaciatok_rok', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Novinka',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nazov', models.CharField(max_length=200)),
                ('text', ckeditor.fields.RichTextField()),
                ('vytvorene', models.DateTimeField(auto_now_add=True)),
                ('upravene', models.DateTimeField(auto_now=True)),
                ('autor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='nextis.Clovek')),
            ],
            options={
                'verbose_name_plural': '     Novinky',
            },
        ),
        migrations.CreateModel(
            name='Rola',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
        ),
        migrations.CreateModel(
            name='Skola',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nazov', models.CharField(max_length=100)),
                ('mesto', models.CharField(max_length=100)),
                ('skratka', models.CharField(max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='Lektor',
            fields=[
                ('rola_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='nextis.Rola')),
                ('popis', models.TextField()),
                ('clovek', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='nextis.Clovek')),
            ],
            options={
                'verbose_name_plural': '   Lektori',
            },
            bases=('nextis.rola',),
        ),
        migrations.CreateModel(
            name='Student',
            fields=[
                ('rola_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='nextis.Rola')),
                ('datum_nar', models.DateField()),
                ('rok_zaciatku', models.DateField()),
                ('clovek', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, to='nextis.Clovek')),
            ],
            options={
                'verbose_name_plural': '   Studenti',
            },
            bases=('nextis.rola',),
        ),
        migrations.AddField(
            model_name='fakulta',
            name='skola',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='nextis.Skola'),
        ),
        migrations.AddField(
            model_name='student',
            name='fakulta',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='nextis.Fakulta'),
        ),
        migrations.AddField(
            model_name='student',
            name='level',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='nextis.Level'),
        ),
        migrations.AddField(
            model_name='student',
            name='skolne',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='skolne.Skolne'),
        ),
        migrations.AddField(
            model_name='guidevztah',
            name='student',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='nextis.Student'),
        ),
        migrations.AddField(
            model_name='buddyvztah',
            name='mentor',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='buddy_buddy', to='nextis.Student'),
        ),
        migrations.AddField(
            model_name='buddyvztah',
            name='student',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='buddy_student', to='nextis.Student'),
        ),
    ]
