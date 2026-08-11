from api.models import Disaster
from django.contrib.auth import get_user_model
from django.db.models import Count
from django.db.models.functions import ExtractYear

User = get_user_model()


def get_disaster_counts():
    """
    Returns a list of dicts: [{'disasterType': 'Flood', 'count': 3}, ...]
    """
    return list(
        Disaster.objects.values('disasterType').annotate(count=Count('id'))
    )


def get_disaster_counts_by_year():
    """
    Returns a list of dicts: [{'year': 2020, 'count': 5}, ...]
    """
    return list(
        Disaster.objects.values(year=ExtractYear('date')).annotate(count=Count('id')).values('year', 'count')
    )
    
    
def disaster_counts_by_region():
    """
    Returns a list of dicts: [{'continent': 'Asia', 'count': 10}, ...]
    """
    return list(
        Disaster.objects.values('continent').annotate(count=Count('id'))
    )


def get_user_stats():
    """
    Returns total users plus simple breakdowns for the admin dashboard.
    """
    return {
        'total': User.objects.count(),
        'active': User.objects.filter(is_active=True).count(),
        'verified': User.objects.filter(is_verified=True).count(),
        'normal': User.objects.filter(user_type='Normal').count(),
        'organization': User.objects.filter(user_type='Organization').count(),
    }