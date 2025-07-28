from timezonefinder import TimezoneFinder
from datetime import datetime
import pytz

def current_local_time(latitude, longitude):
    """
    Determine if it's day or night at the given latitude and longitude.
    
    Args:
        latitude (float): Latitude of the location.
        longitude (float): Longitude of the location.
    
    Returns:
        bool: True if it's daytime, False if it's nighttime.
    """
    # Get the timezone using the coordinates
    tf = TimezoneFinder()
    timezone_str = tf.timezone_at(lat=latitude, lng=longitude)

    if timezone_str:
        # Get the current local time in the determined timezone
        tz = pytz.timezone(timezone_str)
        local_time = datetime.now(tz)

        # Extract the hour from the local time
        hour = local_time.hour

        # Return True for daytime (6 AM to 6 PM), False for nighttime
        return 6 <= hour < 18
    else:
        # If timezone is not found, raise an exception
        raise ValueError("Timezone not found for the given coordinates.")
        
