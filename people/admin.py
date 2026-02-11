from django.contrib import admin
from .models import Person

@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = [
        'full_name',
        'member_type',
        'department',
        'position',
        'status',
        'start_date',
        'is_active_member',
        'portal_email',
        'portal_role',
    ]

    list_filter = [
        'status',
        'department',
        'start_date'
    ]

    search_fields = [
        'full_name',
        'acdc_email',
        'personal_email',
        'portal_email',
        'department'
    ]

    fieldsets = (
        ('Personal Information', {
            'fields': ('full_name', 'acdc_email', 'personal_email', 'phone')
        }),
        ('Employment Details', {
            'fields': (
                'member_type',
                'department',
                'subteam',
                'position',
                'status',
                'timezone',
                'time_commitment',
                'reports_to',
                'portal_email',
                'portal_role',
                'portal_password',
            )
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date')
        }),
    )

    readonly_fields = ['created_at', 'updated_at']
    ordering = ['full_name']
    list_per_page = 25
