
from django.contrib import admin
from django.shortcuts import HttpResponse

# Register your models here.

# TODO super user zajozor, rootroot

from django.contrib.auth.models import User,Group
from django.contrib.auth.admin import UserAdmin
from nexteria.nextis.models import UserProfile
from .models import *

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    fk_name = 'user'

class UserAdmin(admin.ModelAdmin):
    list_select_related = True
    inlines = [
        UserProfileInline,
    ]
    
admin.site.register(User, UserAdmin)

class GroupDescriptionInline(admin.StackedInline):
    model = GroupDescription
    fk_name = 'group'

class GroupAdmin(admin.ModelAdmin):
    list_select_related = True
    inlines = [
        GroupDescriptionInline,
    ]

admin.site.register(Group, GroupAdmin)

'''
class ClovekAdmin(admin.ModelAdmin):
    list_display = ['get_name','email','telefon_cislo']
    search_fields = ['meno','priezvisko','email','telefon_cislo']

admin.site.register(Clovek, ClovekAdmin)
'''
#admin.site.register(Rola)

# TODO update field names
def export_student_list(modeladmin, request, queryset):
    import csv
    from django.utils.encoding import smart_str
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename=nexteria_zoznam_studentov.csv'
    writer = csv.writer(response, csv.excel)
    response.write(u'\ufeff'.encode('utf8')) # BOM (optional...Excel needs it to open UTF-8 file properly)
    writer.writerow([
        smart_str(u"Meno"),
        smart_str(u"Priezvisko"),
        smart_str(u"Email"),
        smart_str(u"Telefon"),
        smart_str(u"Datum nar."),
        smart_str(u"Fakulta"),
        smart_str(u"Rok zaciatku"),
        smart_str(u"Level"),
        smart_str(u"Skolne"),
    ])

    for obj in queryset:
        writer.writerow([
            smart_str(obj.clovek.meno),
            smart_str(obj.clovek.priezvisko),
            smart_str(obj.clovek.email),
            smart_str(obj.clovek.telefon_cislo),
            smart_str(obj.datum_nar),
            smart_str(obj.fakulta),
            smart_str(obj.rok_zaciatku),
            smart_str(obj.level),
            smart_str(obj.skolne),
        ])
    return response
export_student_list.short_description = 'Exportuj vybratych studentov do zoznamu'

    #TODO display level / groups
class StudentAdmin(admin.ModelAdmin):
    list_display = ['user','get_email','get_phone','tuition', 'faculty']
    list_filter = ['faculty']

    actions = [export_student_list, ]

admin.site.register(Student, StudentAdmin)

class LectorAdmin(admin.ModelAdmin):
    list_display = ['user'] #,'get_email','get_telefon']

admin.site.register(Lector, LectorAdmin)
'''
class GuideVztahAdmin(admin.ModelAdmin):
    list_display = ['mentor','student','zaciatok','get_koniec']

admin.site.register(GuideVztah, GuideVztahAdmin)

class BuddyVztahAdmin(admin.ModelAdmin):
    list_display = ['mentor','student','zaciatok','get_koniec']
admin.site.register(BuddyVztah,BuddyVztahAdmin)
'''


'''
class LevelAdmin(admin.ModelAdmin):
    pass

admin.site.register(Level, LevelAdmin)
'''



class NewsAdmin(admin.ModelAdmin):

    list_display = ['title', 'author', 'created', 'edited']
    list_filter = ['created']
    pass

admin.site.register(News, NewsAdmin)

admin.site.register(School)
admin.site.register(Faculty)


