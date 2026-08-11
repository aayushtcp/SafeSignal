# Generated manually for FCM token TextField widen

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_alert'),
    ]

    operations = [
        migrations.AlterField(
            model_name='fcmtoken',
            name='fcm_token',
            field=models.TextField(unique=True),
        ),
    ]
